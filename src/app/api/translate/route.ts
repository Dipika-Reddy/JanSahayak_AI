import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { text, targetLang } = await req.json();

    if (!text || !targetLang) {
      return NextResponse.json({ error: 'Text and targetLang are required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" }); // Using lite for faster translations
    
    const prompt = `Translate the following UI text into the language code: ${targetLang}. 
    Return ONLY the translated string, with no additional formatting, quotes, or markdown.
    
    Text to translate:
    ${text}`;

    const result = await model.generateContent(prompt);
    let translatedText = result.response.text().trim();
    
    // Clean up any potential markdown or quotes
    translatedText = translatedText.replace(/^["'](.*)["']$/, '$1');

    return NextResponse.json({ translatedText });
    
  } catch (error) {
    console.error('Error in translate API:', error);
    return NextResponse.json(
      { error: 'Failed to translate' }, 
      { status: 500 }
    );
  }
}
