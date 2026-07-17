import { NextResponse } from 'next/server';
import { Scheme } from '@/lib/mock-schemes';
import { prisma } from '@/lib/prisma';

/** 
 * Translates an array of strings to the target language in a single Google Translate batch call.
 * Uses ' ___ ' as a delimiter to pack many strings into one request.
 * Returns a map of original → translated.
 */
async function batchTranslate(texts: string[], lang: string): Promise<Record<string, string>> {
  if (lang === 'en-IN' || texts.length === 0) return {};
  
  const langCode = lang.split('-')[0];
  // Minority langs not well-supported by Google Translate → fall back to Hindi
  const tl = ['brx', 'ks', 'mni', 'sat', 'doi', 'mai', 'kok'].includes(langCode) ? 'hi' : langCode;
  
  // De-duplicate so we don't waste quota on repeated strings
  const unique = [...new Set(texts.filter(t => t && t.trim()))];
  if (unique.length === 0) return {};

  const delimiter = ' ||| ';
  const map: Record<string, string> = {};

  // Google Translate URL has a character limit (~4000 chars per request)
  // Split into chunks to be safe
  const CHUNK_CHARS = 3500;
  let chunk: string[] = [];
  let chunkLen = 0;

  const translateChunk = async (items: string[]) => {
    const joined = items.join(delimiter);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${tl}&dt=t&q=${encodeURIComponent(joined)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Google Translate HTTP ${res.status}`);
    const data = await res.json();
    const translated: string = data?.[0]?.map((x: any) => x[0]).join('') || '';
    const parts = translated.split(/\s*\|\|\|\s*/);
    items.forEach((orig, i) => {
      map[orig] = parts[i]?.trim() || orig;
    });
  };

  try {
    for (const text of unique) {
      if (chunkLen + text.length > CHUNK_CHARS && chunk.length > 0) {
        await translateChunk(chunk);
        chunk = [];
        chunkLen = 0;
      }
      chunk.push(text);
      chunkLen += text.length + delimiter.length;
    }
    if (chunk.length > 0) await translateChunk(chunk);
  } catch (e) {
    console.warn('[match-schemes] Translation failed, returning English:', e);
  }

  return map;
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
            reason: finalReason,
          },
        });
      }
    }

    // ── Translate ALL user-visible text fields if language is not English ──
    if (lang !== 'en-IN' && matches.length > 0) {
      // Collect every unique translatable string from all matched schemes
      const toTranslate: string[] = [];

      for (const m of matches) {
        if (m.description) toTranslate.push(m.description);
        if (m.benefits) toTranslate.push(m.benefits);
        if (m.matchDetails.reason) toTranslate.push(m.matchDetails.reason);
        if (m.offline_process) toTranslate.push(m.offline_process);
        if (m.nearest_office) toTranslate.push(m.nearest_office);
        if (Array.isArray(m.required_documents)) {
          m.required_documents.forEach((d: string) => { if (d) toTranslate.push(d); });
        }
      }

      const tMap = await batchTranslate(toTranslate, lang);

      // Apply translations back to each match
      if (Object.keys(tMap).length > 0) {
        for (const m of matches) {
          if (tMap[m.description]) m.description = tMap[m.description];
          if (tMap[m.benefits]) m.benefits = tMap[m.benefits];
          if (tMap[m.matchDetails.reason]) m.matchDetails.reason = tMap[m.matchDetails.reason];
          if (m.offline_process && tMap[m.offline_process]) m.offline_process = tMap[m.offline_process];
          if (m.nearest_office && tMap[m.nearest_office]) m.nearest_office = tMap[m.nearest_office];
          if (Array.isArray(m.required_documents)) {
            m.required_documents = m.required_documents.map((d: string) => tMap[d] || d);
          }
        }
      }
    }

    return NextResponse.json({ matches });
  } catch (error) {
    console.error('Error in match-schemes API:', error);
    return NextResponse.json({ error: 'Failed to process matching engine' }, { status: 500 });
  }
}
