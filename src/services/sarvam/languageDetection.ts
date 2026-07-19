/**
 * services/sarvam/languageDetection.ts
 *
 * Service for identifying text language using Sarvam AI.
 */

import { SARVAM_BASE_URL, getSarvamHeaders } from '@/lib/sarvam';

export interface LanguageDetectionResult {
  languageCode: string;
  scriptCode: string;
  requestId: string;
}

export async function detectLanguage(text: string): Promise<LanguageDetectionResult | null> {
  if (!text || !text.trim()) {
    return null;
  }

  const url = `${SARVAM_BASE_URL}/text-lid`;
  const headers = getSarvamHeaders();

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ input: text.substring(0, 1000) }),
    });

    if (!res.ok) {
      console.warn(`[Sarvam Language Detection] HTTP Error ${res.status}`);
      return null;
    }

    const data = await res.json();
    if (data && data.language_code) {
      return {
        languageCode: data.language_code,
        scriptCode: data.script_code || '',
        requestId: data.request_id || '',
      };
    }
    return null;
  } catch (error) {
    console.error('[Sarvam Language Detection] Failed to detect language:', error);
    return null;
  }
}
