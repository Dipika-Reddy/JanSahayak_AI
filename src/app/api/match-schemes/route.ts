import { NextResponse } from 'next/server';
import { MySchemeService } from '@/backend/services/myscheme/mySchemeService';
import { checkEligibility, calculateRelevanceScore } from '@/backend/services/myscheme/eligibilityMatcher';

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

  // Use a safe delimiter sequence that Google Translate preserves verbatim
  const delimiter = ' ~~~ ';
  const delimiterRegex = /\s*~~~\s*/;
  const map: Record<string, string> = {};

  // Google Translate URL has a character limit (~4000 chars per request)
  // Split into chunks to be safe
  const CHUNK_CHARS = 3500;
  const chunks: string[][] = [];
  let currentChunk: string[] = [];
  let currentLen = 0;

  const translateChunk = async (items: string[]) => {
    const joined = items.join(delimiter);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${tl}&dt=t&q=${encodeURIComponent(joined)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Google Translate HTTP ${res.status}`);
    const data = await res.json();
    const translated: string = data?.[0]?.map((x: any) => x[0]).join('') || '';
    const parts = translated.split(delimiterRegex);
    items.forEach((orig, i) => {
      const val = (parts[i]?.trim() || orig)
        .replace(/\n+/g, ' ')
        .replace(/~~~/g, '')
        .replace(/⟦SEP⟧/g, '')
        .replace(/\|{2,}/g, '')
        .replace(/\s{2,}/g, ' ');
      map[orig] = val;
    });
  };

  for (const text of unique) {
    if (currentLen + text.length > CHUNK_CHARS && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = [];
      currentLen = 0;
    }
    currentChunk.push(text);
    currentLen += text.length + delimiter.length;
  }
  if (currentChunk.length > 0) chunks.push(currentChunk);

  try {
    await Promise.all(chunks.map(c => translateChunk(c)));
  } catch (e) {
    console.warn('[match-schemes] Translation batch warning:', e);
  }

  return map;
}

export async function POST(req: Request) {
  let lang = 'en-IN';
  try {
    const body = await req.json();
    lang = body.lang || 'en-IN';
    const profile = body.profile;
    const promptText = body.promptText || '';

    if (!profile) {
      return NextResponse.json({ error: 'Profile is required' }, { status: 400 });
    }

    // Fetch schemes from the MyScheme service (re-routing live or local fallback)
    const schemes = await MySchemeService.getSchemes();
    const matches: any[] = [];

    for (const scheme of schemes) {
      const eligibilityResult = checkEligibility(scheme, profile);
      if (eligibilityResult.isEligible) {
        let finalReason = 'You meet the general eligibility criteria.';
        if (eligibilityResult.reasons.length > 0) {
          finalReason = `You qualify because this scheme ${eligibilityResult.reasons.join(' and ')}.`;
        }

        const score = calculateRelevanceScore(scheme, profile, promptText);

        matches.push({
          ...scheme,
          matchDetails: {
            eligibility: 'Eligible',
            reason: finalReason,
            relevanceScore: score,
          },
        });
      }
    }

    // Sort matches descending by relevance score so the most relevant schemes appear first!
    matches.sort((a, b) => b.matchDetails.relevanceScore - a.matchDetails.relevanceScore);

    // ── Fast parallel translation of top matched schemes ──
    if (lang !== 'en-IN' && matches.length > 0) {
      for (const m of matches) {
        m.name_en = m.name;
      }

      // Prioritize top 50 matches (pages 1-10) for instant response
      const topMatches = matches.slice(0, 50);
      const toTranslate: string[] = [];

      for (const m of topMatches) {
        if (m.name) toTranslate.push(m.name);
        if (m.category) toTranslate.push(m.category);
        if (m.central_or_state) toTranslate.push(m.central_or_state);
        if (m.description) toTranslate.push(m.description);
        if (m.benefits) toTranslate.push(m.benefits);
        if (m.matchDetails.reason) toTranslate.push(m.matchDetails.reason);
        if (m.matchDetails.eligibility) toTranslate.push(m.matchDetails.eligibility);
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
          if (tMap[m.name]) m.name = tMap[m.name];
          if (tMap[m.category]) m.category = tMap[m.category];
          if (tMap[m.central_or_state]) m.central_or_state = tMap[m.central_or_state];
          if (tMap[m.description]) m.description = tMap[m.description];
          if (tMap[m.benefits]) m.benefits = tMap[m.benefits];
          if (tMap[m.matchDetails.reason]) m.matchDetails.reason = tMap[m.matchDetails.reason];
          if (tMap[m.matchDetails.eligibility]) m.matchDetails.eligibility = tMap[m.matchDetails.eligibility];
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
