import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateContentWithRetry } from '@/lib/gemini-utils';
import { mockSchemes } from '@/lib/mock-schemes';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { profile, lang = 'en-IN' } = await req.json();

    if (!profile) {
      return NextResponse.json({ error: 'Profile is required' }, { status: 400 });
    }

    const prompt = `
    You are an expert on Indian Government Welfare Schemes.
    Given the following user profile and a list of available schemes, determine which schemes the user is eligible for.
    
    IMPORTANT: Do not just rely on simple keyword matching. Infer the user's eligibility based on demographic factors (age, gender, income, state, occupation, disability, pregnancy, student status) and match them logically against the scheme's criteria.

    User Profile:
    ${JSON.stringify(profile, null, 2)}
    
    Available Schemes:
    ${JSON.stringify(mockSchemes, null, 2)}
    
    Return a JSON object with a "matches" array. Each object in the array MUST have:
    - "id": string (the scheme id)
    - "name": string
    - "description": string
    - "benefits": string
    - "required_documents": array of strings
    - "application_link": string
    - "matchDetails": object with "eligibility" (string: "Eligible" or "Potentially Eligible") and "reason" (string explaining exactly why they match based on their profile in the requested language).
    
    Translate the "reason" field and any other text fields (like description and benefits) into the language code: ${lang}
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

    let matches = [];
    try {
      const data = JSON.parse(text);
      matches = data.matches || [];
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON output in match-schemes:', text);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    return NextResponse.json({ matches });
  } catch (error) {
    console.error('Error in match-schemes API:', error);
    return NextResponse.json({ 
      error: 'Failed to match schemes: ' + (error instanceof Error ? error.message : String(error)) 
    }, { status: 500 });
  }
}
