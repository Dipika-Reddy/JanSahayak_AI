import { NextResponse } from 'next/server';
import { Scheme } from '@/lib/mock-schemes';
import { prisma } from '@/lib/prisma';

/** Translates an array of reason strings to the target language in one batch call */
async function batchTranslateReasons(reasons: string[], lang: string): Promise<Record<string, string>> {
  if (lang === 'en-IN' || reasons.length === 0) return {};
  try {
    const langCode = lang.split('-')[0];
    // Minority langs not supported by Google Translate → fall back to Hindi for voice
    const ttsLang = ['brx', 'ks', 'mni', 'sat', 'doi', 'mai', 'kok'].includes(langCode) ? 'hi' : langCode;
    const delimiter = ' ___ ';
    const joined = reasons.join(delimiter);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${ttsLang}&dt=t&q=${encodeURIComponent(joined)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Google Translate status ${res.status}`);
    const data = await res.json();
    const translated: string = data?.[0]?.map((x: any) => x[0]).join('') || '';
    const parts = translated.split(/\s*___\s*/);
    const map: Record<string, string> = {};
    reasons.forEach((r, i) => { map[r] = parts[i]?.trim() || r; });
    return map;
  } catch (e) {
    console.warn('[match-schemes] Reason translation failed, returning English:', e);
    return {};
  }
}

export async function POST(req: Request) {
  let lang = 'en-IN';
  try {
    const body = await req.json();
    lang = body.lang || 'en-IN';
    const profile = body.profile;

    if (!profile) {
      return NextResponse.json({ error: 'Profile is required' }, { status: 400 });
    }

    // Fetch schemes from the database
    const dbSchemes = await prisma.scheme.findMany();
    
    const schemes: Scheme[] = dbSchemes.map((s: any) => ({
      ...s,
      applicable_states: s.applicable_states as string[],
      required_documents: s.required_documents as string[],
      tags: s.tags as string[],
      target_occupations: s.target_occupations as string[],
    }));

    const matches: any[] = [];

    for (const scheme of schemes) {
      const reasons: string[] = [];
      let isEligible = true;

      // Rule: Gender
      if (scheme.target_gender !== 'All') {
        if (!profile.gender || profile.gender.toLowerCase() !== scheme.target_gender.toLowerCase()) {
          isEligible = false;
        } else {
          reasons.push(`matches your gender (${profile.gender})`);
        }
      }

      // Rule: State
      if (!scheme.applicable_states.includes('All')) {
        if (!profile.state || !scheme.applicable_states.some((s: string) => s.toLowerCase() === profile.state.toLowerCase())) {
          isEligible = false;
        } else {
          reasons.push(`is applicable in your state (${profile.state})`);
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

      if (isEligible) {
        let finalReason = 'You meet the general eligibility criteria.';
        if (reasons.length > 0) {
          finalReason = `You qualify because this scheme ${reasons.join(' and ')}.`;
        }

        matches.push({
          ...scheme,
          matchDetails: {
            eligibility: 'Eligible',
            reason: finalReason
          }
        });
      }
    }
    
    // Translate all reason strings in a single batch if the language is not English
    if (lang !== 'en-IN' && matches.length > 0) {
      const uniqueReasons = [...new Set(matches.map(m => m.matchDetails.reason))] as string[];
      const translationMap = await batchTranslateReasons(uniqueReasons, lang);
      if (Object.keys(translationMap).length > 0) {
        matches.forEach(m => {
          if (translationMap[m.matchDetails.reason]) {
            m.matchDetails.reason = translationMap[m.matchDetails.reason];
          }
        });
      }
    }

    return NextResponse.json({ matches });
  } catch (error) {
    console.error('Error in match-schemes API:', error);
    return NextResponse.json({ error: 'Failed to process matching engine' }, { status: 500 });
  }
}
