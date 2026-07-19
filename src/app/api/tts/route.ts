import { NextResponse } from 'next/server';
import { textToSpeechWithSarvam } from '@/services/sarvam/ttsService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');
  const lang = searchParams.get('lang');

  if (!text || !lang) {
    return NextResponse.json({ error: 'Missing text or lang' }, { status: 400 });
  }

  // Try Sarvam AI Text-to-Speech first
  try {
    const audioBuffer = await textToSpeechWithSarvam({ text, lang });
    if (audioBuffer) {
      return new NextResponse(new Uint8Array(audioBuffer), {
        headers: {
          'Content-Type': 'audio/wav',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
  } catch (sarvamErr) {
    console.warn('[TTS API] Sarvam TTS failed, falling back to Google TTS:', sarvamErr);
  }

  try {
    let cleanLang = lang.split('-')[0];
    
    // Fallback mappings for minor regional languages not natively supported by TTS voices
    const minorLangFallbacks: Record<string, string> = {
      'brx': 'hi',   // Bodo -> Hindi voice
      'doi': 'hi',   // Dogri -> Hindi voice
      'ks': 'ur',    // Kashmiri -> Urdu voice
      'mai': 'hi',   // Maithili -> Hindi voice
      'mni': 'bn',   // Manipuri -> Bengali voice
      'sat': 'hi',   // Santali -> Hindi voice
      'kok': 'mr',   // Konkani -> Marathi voice
    };

    if (minorLangFallbacks[cleanLang]) {
      cleanLang = minorLangFallbacks[cleanLang];
    }

    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${cleanLang}&client=tw-ob`;
    
    // Fetch from Google Translate TTS (server-side, so no CORS or Referer restrictions)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      }
    });

    if (!response.ok) {
      throw new Error(`Google TTS API returned ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('TTS Proxy Error:', error);
    return NextResponse.json({ error: 'Failed to generate audio' }, { status: 500 });
  }
}
