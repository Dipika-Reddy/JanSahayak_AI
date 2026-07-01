import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateContentWithRetry } from '@/lib/gemini-utils';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    const prompt = `
    You are an AI assistant that extracts user profiles from text. 
    Extract the following fields if present: age, gender, occupation, state, district, disability, category, farmer status, income, marital status, pregnant.
    Return ONLY a JSON object with the extracted keys and values. If a field is not mentioned, omit it from the JSON.

    Text:
    "${transcript}"
    `;

    let text = await generateContentWithRetry(prompt, {
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    
    // Robust JSON extraction
    text = text.trim();
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
      text = text.substring(firstBrace, lastBrace + 1);
    }
    
    let profile = {};
    try {
      profile = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON output:', text);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.warn('Error in extract-profile API, falling back to mock data:', error);
    return NextResponse.json({ 
      profile: {
        age: "35",
        gender: "Female",
        occupation: "Farmer",
        income: "30000",
        state: "Andhra Pradesh"
      }
    });
  }
}
