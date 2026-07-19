/**
 * services/sarvam/ttsService.ts
 *
 * Service for Text-to-Speech using Sarvam AI with Google Translate fallback.
 */

import { SARVAM_BASE_URL, getSarvamHeaders, isSarvamConfigured } from '@/lib/sarvam';

export interface TtsOptions {
  text: string;
  lang: string; // e.g. "hi-IN", "en-IN"
}

/**
 * Generate audio binary buffer from text using Sarvam AI Text-to-Speech.
 * Returns null if the request fails or is unconfigured.
 */
export async function textToSpeechWithSarvam({
  text,
  lang,
}: TtsOptions): Promise<Buffer | null> {
  if (!text || !text.trim()) return null;
  if (!isSarvamConfigured()) return null;

  // Align language codes (ensure regional format like en-IN, hi-IN)
  const formatLang = (l: string) => {
    if (!l.includes('-')) {
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

  const tl = formatLang(lang);
  const url = `${SARVAM_BASE_URL}/text-to-speech`;
  const headers = getSarvamHeaders();

  // Speaker voices based on language preferences or fallback to 'shubh'
  const speaker = 'shubh'; 

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        text,
        target_language_code: tl,
        speaker,
        model: 'bulbul:v3',
      }),
    });

    if (!res.ok) {
      console.warn(`[Sarvam TTS] HTTP Error ${res.status}`);
      return null;
    }

    const data = await res.json();
    if (data && data.audios && data.audios.length > 0) {
      const base64String = data.audios[0];
      return Buffer.from(base64String, 'base64');
    }
    return null;
  } catch (error) {
    console.error('[Sarvam TTS] API call failed:', error);
    return null;
  }
}
