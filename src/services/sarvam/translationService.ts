/**
 * services/sarvam/translationService.ts
 *
 * Service for translating text using Sarvam AI with fallbacks.
 */

import { SARVAM_BASE_URL, getSarvamHeaders, isSarvamConfigured } from '@/lib/sarvam';

export interface TranslationOptions {
  text: string;
  sourceLang: string; // e.g. "en-IN" or "auto"
  targetLang: string; // e.g. "hi-IN"
}

/**
 * Translate a single string using Sarvam AI.
 * Falls back to null if the request fails or is unconfigured.
 */
export async function translateTextWithSarvam({
  text,
  sourceLang,
  targetLang,
}: TranslationOptions): Promise<string | null> {
  if (!text || !text.trim()) return '';
  if (!isSarvamConfigured()) return null;

  // Align language codes (ensure regional format like en-IN, hi-IN)
  const formatLang = (l: string) => {
    if (l === 'auto') return 'auto';
    if (!l.includes('-')) {
      // Map base language codes to their standard BCP-47 Indian regional formats
      const mapping: Record<string, string> = {
        en: 'en-IN', hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN',
        kn: 'kn-IN', ml: 'ml-IN', mr: 'mr-IN', gu: 'gu-IN',
        bn: 'bn-IN', pa: 'pa-IN', or: 'or-IN', as: 'as-IN',
        ur: 'ur-IN', sa: 'sa-IN', kok: 'kok-IN', ne: 'ne-IN',
        ks: 'ks-IN', mai: 'mai-IN', sd: 'sd-IN', brx: 'brx-IN',
        doi: 'doi-IN', mni: 'mni-IN', sat: 'sat-IN'
      };
      return mapping[l] || `${l}-IN`;
    }
    return l;
  };

  const sl = formatLang(sourceLang);
  const tl = formatLang(targetLang);

  if (sl === tl) return text;

  const url = `${SARVAM_BASE_URL}/translate`;
  const headers = getSarvamHeaders();

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        input: text,
        source_language_code: sl,
        target_language_code: tl,
      }),
    });

    if (!res.ok) {
      console.warn(`[Sarvam Translate] HTTP Error ${res.status}`);
      return null;
    }

    const data = await res.json();
    return data.translated_text || null;
  } catch (error) {
    console.error('[Sarvam Translate] API call failed:', error);
    return null;
  }
}

/**
 * Translate multiple strings in parallel using Sarvam AI.
 * Falls back to null for any failures.
 */
export async function translateTextsWithSarvam(
  texts: string[],
  sourceLang: string,
  targetLang: string
): Promise<Record<string, string> | null> {
  if (!isSarvamConfigured() || texts.length === 0) return null;

  try {
    const promises = texts.map(async (text) => {
      const translated = await translateTextWithSarvam({ text, sourceLang, targetLang });
      return { original: text, translated: translated || text };
    });

    const results = await Promise.all(promises);
    const resultMap: Record<string, string> = {};
    results.forEach((r) => {
      resultMap[r.original] = r.translated;
    });

    return resultMap;
  } catch (error) {
    console.error('[Sarvam Translate] Batch translation failed:', error);
    return null;
  }
}
