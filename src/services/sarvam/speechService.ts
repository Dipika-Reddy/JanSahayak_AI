/**
 * services/sarvam/speechService.ts
 *
 * Service for transcribing audio using Sarvam AI Speech-to-Text.
 */

import { SARVAM_BASE_URL, SARVAM_API_KEY, isSarvamConfigured } from '@/lib/sarvam';
import { detectLanguage } from './languageDetection';

export interface TranscriptionResult {
  transcript: string;
  languageCode: string | null;
}

/**
 * Transcribes audio buffer using Sarvam AI Speech-to-Text API.
 * Uses 'unknown' language_code if none provided to auto-detect language.
 */
export async function transcribeAudio(
  audioBuffer: Buffer,
  filename = 'audio.wav',
  languageCode = 'unknown'
): Promise<TranscriptionResult | null> {
  if (!isSarvamConfigured()) return null;

  const url = `${SARVAM_BASE_URL}/speech-to-text`;

  // Create multipart/form-data boundary and body
  const formData = new FormData();
  const blob = new Blob([new Uint8Array(audioBuffer)], { type: 'audio/wav' });
  formData.append('file', blob, filename);
  formData.append('model', 'saaras:v3');
  formData.append('language_code', languageCode);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'api-subscription-key': SARVAM_API_KEY,
      },
      body: formData,
    });

    if (!res.ok) {
      console.warn(`[Sarvam STT] HTTP Error ${res.status}`);
      return null;
    }

    const data = await res.json();
    if (data && data.transcript) {
      const transcriptText = data.transcript.trim();

      // If language was unknown, detect language from the transcribed text
      let detectedLang: string | null = null;
      if (languageCode === 'unknown' && transcriptText) {
        const lidResult = await detectLanguage(transcriptText);
        if (lidResult) {
          detectedLang = lidResult.languageCode;
        }
      }

      return {
        transcript: transcriptText,
        languageCode: detectedLang || (languageCode !== 'unknown' ? languageCode : null),
      };
    }
    return null;
  } catch (error) {
    console.error('[Sarvam STT] API call failed:', error);
    return null;
  }
}
