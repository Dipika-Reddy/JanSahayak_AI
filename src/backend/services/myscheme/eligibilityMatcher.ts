import { NormalizedScheme } from './schemeParser';

export interface Profile {
  age?: number | null;
  gender?: string | null;
  occupation?: string | null;
  maritalStatus?: string | null;
  state?: string | null;
  income?: number | null;
  category?: string | null;
  disability?: boolean | null;
  pregnant?: boolean | null;
  farmer?: boolean | null;
  student?: boolean | null;
  seniorCitizen?: boolean | null;
  dailyWageWorker?: boolean | null;
  bpl?: boolean | null;
}

export interface EligibilityResult {
  isEligible: boolean;
  reasons: string[];
}

export function checkEligibility(scheme: NormalizedScheme, profile: Profile): EligibilityResult {
  const reasons: string[] = [];
  let isEligible = true;

  // Rule: Gender
  if (scheme.target_gender && scheme.target_gender !== 'All') {
    if (!profile.gender || profile.gender.toLowerCase() !== scheme.target_gender.toLowerCase()) {
      isEligible = false;
    } else {
      reasons.push(`matches your gender (${profile.gender})`);
    }
  }

  // Rule: State (Strict Filtering)
  if (profile.state && scheme.applicable_states && scheme.applicable_states.length > 0) {
    const states = scheme.applicable_states.map((s: string) => s.toLowerCase().trim());
    const userState = profile.state.toLowerCase().trim();
    const isNational = states.includes('all') || states.includes('national') || states.includes('central') || scheme.central_or_state?.toLowerCase() === 'central';
    const isStateMatch = states.some((s: string) => s === userState || userState.includes(s) || s.includes(userState));
    
    if (!isNational && !isStateMatch) {
      isEligible = false;
    } else if (isStateMatch) {
      reasons.push(`is applicable in your state (${profile.state})`);
    } else if (isNational) {
      reasons.push(`is a national scheme applicable across India`);
    }
  }

  // Rule: Occupations / Statuses
  if (scheme.is_farmer_only && profile.occupation?.toLowerCase() !== 'farmer' && profile.farmer !== true) {
    isEligible = false;
  } else if (scheme.is_farmer_only) {
    reasons.push('is designed for farmers');
  }

  if (scheme.is_student_only && profile.occupation?.toLowerCase() !== 'student' && profile.student !== true) {
    isEligible = false;
  } else if (scheme.is_student_only) {
    reasons.push('supports students');
  }

  if (scheme.is_pregnant_only && profile.pregnant !== true) {
    isEligible = false;
  } else if (scheme.is_pregnant_only) {
    reasons.push('supports pregnant women');
  }

  if (scheme.is_daily_wage_only && profile.occupation?.toLowerCase() !== 'daily wage labourer' && profile.dailyWageWorker !== true) {
    isEligible = false;
  } else if (scheme.is_daily_wage_only) {
    reasons.push('supports daily wage labourers');
  }

  // Rule: Marital Status
  if (profile.maritalStatus === 'Widow') {
    const text = `${scheme.name} ${scheme.category} ${scheme.description} ${scheme.benefits}`.toLowerCase();
    if (text.includes('widow') || text.includes('destitute') || text.includes('pension')) {
      reasons.push('supports widows and destitute women');
    }
  }

  // Rule: Age
  if (profile.age !== undefined && profile.age !== null) {
    if (scheme.min_age && profile.age < scheme.min_age) isEligible = false;
    if (scheme.max_age && profile.age > scheme.max_age) isEligible = false;
    if (isEligible && (scheme.min_age || scheme.max_age)) {
      reasons.push('fits your age bracket');
    }
  } else if (scheme.is_senior_only && profile.seniorCitizen !== true) {
    isEligible = false;
  } else if (scheme.is_senior_only) {
    reasons.push('is for senior citizens');
  }

  // Rule: Income limit
  if (profile.income !== undefined && profile.income !== null && scheme.income_limit !== null) {
    if (profile.income > scheme.income_limit) {
      isEligible = false;
    } else {
      reasons.push(`income is within limits (limit: ₹${scheme.income_limit.toLocaleString('en-IN')})`);
    }
  }

  // Rule: BPL Card
  if (scheme.is_bpl_only && profile.bpl !== true) {
    isEligible = false;
  } else if (scheme.is_bpl_only) {
    reasons.push('is designated for BPL families');
  }

  return {
    isEligible,
    reasons,
  };
}

export function calculateRelevanceScore(scheme: NormalizedScheme, profile: Profile, promptText?: string): number {
  let score = 0;
  const fullText = `${scheme.name} ${scheme.category} ${scheme.description} ${scheme.benefits} ${scheme.tags?.join(' ') || ''}`.toLowerCase();
  const promptLower = (promptText || '').toLowerCase();

  const isStudent = profile.student || profile.occupation?.toLowerCase() === 'student' || promptLower.includes('student') || promptLower.includes('college');
  const isFarmer = profile.farmer || profile.occupation?.toLowerCase() === 'farmer' || promptLower.includes('farmer') || promptLower.includes('kisan');
  const isWidow = profile.maritalStatus?.toLowerCase() === 'widow' || promptLower.includes('widow');
  const isSenior = profile.seniorCitizen || (profile.age !== null && profile.age !== undefined && profile.age >= 60) || promptLower.includes('senior') || promptLower.includes('elderly');
  const isPregnant = profile.pregnant || promptLower.includes('pregnant') || promptLower.includes('maternity');

  // 1. Role / Profile Target Heavy Boosting & Penalization

  // --- Student ---
  if (isStudent) {
    if (scheme.is_student_only) score += 300;
    if (['education', 'scholarship', 'skill development', 'student', 'youth'].some(c => scheme.category.toLowerCase().includes(c))) score += 200;
    if (['scholarship', 'student', 'college', 'tuition', 'education', 'university', 'fellowship', 'stipend', 'vidya', 'fee', 'school', 'matric', 'hostel'].some(kw => fullText.includes(kw))) score += 150;
    
    // Penalize pure widow/funeral/destitute schemes for students
    if (['widow', 'funeral', 'destitute', 'death', 'burial', 'cremation'].some(kw => fullText.includes(kw))) {
      score -= 500;
    }
  }

  // --- Widow ---
  if (isWidow) {
    if (['widow', 'destitute', 'pension', 'single mother', 'women welfare'].some(kw => fullText.includes(kw))) score += 300;
    if (['women', 'social welfare', 'pension', 'empowerment'].some(c => scheme.category.toLowerCase().includes(c))) score += 150;

    // Penalize pure student scholarships for widows unless requested
    if (['student only', 'school student', 'matriculation'].some(kw => fullText.includes(kw))) {
      score -= 300;
    }
  }

  // --- Farmer ---
  if (isFarmer) {
    if (scheme.is_farmer_only) score += 300;
    if (['agriculture', 'farmer', 'rural'].some(c => scheme.category.toLowerCase().includes(c))) score += 200;
    if (['farmer', 'kisan', 'crop', 'agriculture', 'fertilizer', 'irrigation', 'seed', 'pm-kisan', 'rythu', 'soil', 'tractor'].some(kw => fullText.includes(kw))) score += 150;
    
    // Penalize student scholarships for farmers
    if (['student only', 'matriculation'].some(kw => fullText.includes(kw))) {
      score -= 300;
    }
  }

  // --- Senior Citizen ---
  if (isSenior) {
    if (scheme.is_senior_only) score += 300;
    if (['pension', 'senior', 'elderly', 'old age', 'vaya'].some(kw => fullText.includes(kw))) score += 150;
  }

  // --- Pregnant ---
  if (isPregnant) {
    if (scheme.is_pregnant_only) score += 300;
    if (['maternity', 'pregnant', 'mother', 'child', 'poshan', 'matru'].some(kw => fullText.includes(kw))) score += 150;
  }

  // 2. State Alignment Boost
  if (profile.state) {
    const userState = profile.state.toLowerCase();
    const schemeStates = (scheme.applicable_states || []).map(s => s.toLowerCase());
    if (schemeStates.some(s => s === userState || userState.includes(s))) {
      score += 150;
    } else if (scheme.central_or_state?.toLowerCase() === 'central' || schemeStates.includes('all')) {
      score += 50;
    }
  }

  // 3. Direct Prompt Keyword Alignment
  if (promptText) {
    const words = promptText.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    for (const word of words) {
      if (['from', 'with', 'have', 'that', 'this', 'want', 'need', 'find', 'live', 'your', 'about'].includes(word)) continue;
      if (fullText.includes(word)) score += 30;
    }
  }

  // 4. Heavy Penalization for Funeral/Death schemes unless explicitly requested
  const isFuneral = ['funeral', 'death', 'cremation', 'burial', 'deceased', 'post-mortem'].some(kw => fullText.includes(kw));
  const userRequestedFuneral = promptLower.includes('funeral') || promptLower.includes('death');
  if (isFuneral && !userRequestedFuneral) {
    score -= 600;
  }

  return score;
}
