import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateContentWithRetry } from '@/lib/gemini-utils';
import { translateTextWithSarvam, translateTextsWithSarvam } from '@/services/sarvam/translationService';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function translateWithGoogle(text: string, targetLang: string): Promise<string> {
  const langCode = targetLang.split('-')[0];
  // Map Google Translate unsupported codes to Hindi ('hi') fallback
  const supportedCode = ['brx', 'ks', 'mni'].includes(langCode) ? 'hi' : langCode;
  
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${supportedCode}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google Translate returned status ${res.status}`);
  const data = await res.json();
  if (data && data[0]) {
    return data[0].map((x: any) => x[0]).join('');
  }
  throw new Error("Invalid response format from Google Translate");
}

export async function POST(req: Request) {
  let requestPayload: any = {};
  try {
    requestPayload = await req.json();
    const { text, texts, targetLang, sourceLang = 'en-IN' } = requestPayload;

    if (!targetLang) {
      return NextResponse.json({ error: 'targetLang is required' }, { status: 400 });
    }

    const langCode = targetLang.split('-')[0];
    const isUnsupportedByGoogle = ['brx', 'ks', 'mni'].includes(langCode);

    if (texts && Array.isArray(texts)) {
      if (texts.length === 0) {
        return NextResponse.json({ translations: {} });
      }

      // Try Sarvam AI first for batch translation
      try {
        const sarvamTranslations = await translateTextsWithSarvam(texts, sourceLang, targetLang);
        if (sarvamTranslations) {
          return NextResponse.json({ translations: sarvamTranslations });
        }
      } catch (sarvamErr) {
        console.warn("Sarvam batch translation failed, falling back to Gemini/Google:", sarvamErr);
      }

      // Try Gemini first for minority languages (Bodo, Kashmiri, Manipuri)
      if (isUnsupportedByGoogle) {
        try {
          const prompt = `Translate the following list of UI strings into the language code: ${targetLang}. 
          Return the output strictly as a JSON object where the keys are the original English strings and the values are the translations.
          Return ONLY the raw JSON string. Do not wrap it in markdown code block or backticks.

          Strings to translate:
          ${JSON.stringify(texts, null, 2)}`;

          let response = await generateContentWithRetry(prompt, {
            model: "gemini-2.5-flash-lite",
          });

          response = response.trim();
          const cleanJson = response.replace(/```json/gi, '').replace(/```/g, '').trim();
          const translations = JSON.parse(cleanJson);
          return NextResponse.json({ translations });
        } catch (geminiError) {
          console.warn("Gemini batch translation failed for minority lang, falling back to Google Translate (Hindi):", geminiError);
        }
      }

      // Standard Google Translate lookup
      try {
        const delimiter = " ___ ";
        const joined = texts.join(delimiter);
        const translated = await translateWithGoogle(joined, targetLang);
        const splitResult = translated.split(/\s*___\s*/);
        
        const translations: Record<string, string> = {};
        texts.forEach((key, index) => {
          translations[key] = splitResult[index] || key;
        });
        return NextResponse.json({ translations });
      } catch (googleError) {
        console.warn("Google Translate batch failed, trying Gemini as last resort:", googleError);
        
        try {
          const prompt = `Translate the following list of UI strings into the language code: ${targetLang}. 
          Return the output strictly as a JSON object where the keys are the original English strings and the values are the translations.
          Return ONLY the raw JSON string. Do not wrap it in markdown code block or backticks.

          Strings to translate:
          ${JSON.stringify(texts, null, 2)}`;

          let response = await generateContentWithRetry(prompt, {
            model: "gemini-2.5-flash-lite",
          });

          response = response.trim();
          const cleanJson = response.replace(/```json/gi, '').replace(/```/g, '').trim();
          const translations = JSON.parse(cleanJson);
          return NextResponse.json({ translations });
        } catch (finalError) {
          console.error("All translation fallback mechanisms failed:", finalError);
          // Safe return of original texts to prevent crash
          const translations: Record<string, string> = {};
          texts.forEach(key => { translations[key] = key; });
          return NextResponse.json({ translations });
        }
      }
    }

    if (!text) {
      return NextResponse.json({ error: 'Text or texts is required' }, { status: 400 });
    }

    // Try Sarvam AI first for single text translation
    try {
      const sarvamTranslation = await translateTextWithSarvam({ text, sourceLang, targetLang });
      if (sarvamTranslation) {
        return NextResponse.json({ translatedText: sarvamTranslation });
      }
    } catch (sarvamErr) {
      console.warn("Sarvam single translation failed, falling back to Gemini/Google:", sarvamErr);
    }

    // Single string translation
    if (isUnsupportedByGoogle) {
      try {
        const prompt = `Translate the following UI text into the language code: ${targetLang}. 
        Return ONLY the translated string, with no additional formatting, quotes, or markdown.
        
        Text to translate:
        ${text}`;

        let translatedText = await generateContentWithRetry(prompt, {
          model: "gemini-2.5-flash-lite",
        });
        translatedText = translatedText.trim().replace(/^["'](.*)["']$/, '$1');
        return NextResponse.json({ translatedText });
      } catch (e) {
        console.warn("Gemini single translation failed, falling back to Google Translate (Hindi):", e);
      }
    }

    try {
      const translatedText = await translateWithGoogle(text, targetLang);
      return NextResponse.json({ translatedText });
    } catch (googleError) {
      console.warn("Google Translate single failed, trying Gemini as last resort:", googleError);

      try {
        const prompt = `Translate the following UI text into the language code: ${targetLang}. 
        Return ONLY the translated string, with no additional formatting, quotes, or markdown.
        
        Text to translate:
        ${text}`;

        let translatedText = await generateContentWithRetry(prompt, {
          model: "gemini-2.5-flash-lite",
        });
        
        translatedText = translatedText.trim().replace(/^["'](.*)["']$/, '$1');
        return NextResponse.json({ translatedText });
      } catch (finalError) {
        console.error("All single translation fallback mechanisms failed:", finalError);
        return NextResponse.json({ translatedText: text }); // Safe fallback
      }
    }
    
  } catch (error) {
    console.error('Error in translate API:', error);
    // Safe final fallback: return original text/texts so page never crashes!
    try {
      if (requestPayload.texts) {
        const translations: Record<string, string> = {};
        requestPayload.texts.forEach((key: string) => { translations[key] = key; });
        return NextResponse.json({ translations });
      }
      if (requestPayload.text) {
        return NextResponse.json({ translatedText: requestPayload.text });
      }
    } catch (_) {}
    return NextResponse.json(
      { error: 'Failed to translate' }, 
      { status: 500 }
    );
  }
}
