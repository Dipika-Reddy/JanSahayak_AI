import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { mockSchemes } from '@/lib/mock-schemes';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { profile, lang = 'en-IN' } = await req.json();

    if (!profile) {
      return NextResponse.json({ error: 'Profile is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    
    const prompt = `
    You are an expert on Indian Government Welfare Schemes.
    The user has the following profile:
    ${JSON.stringify(profile, null, 2)}
    
    Here is a list of available schemes:
    ${JSON.stringify(mockSchemes, null, 2)}
    
    Evaluate which schemes the user is eligible for. 
    Return a JSON array of objects. Each object should have:
    - schemeId (matching the id of the scheme)
    - eligibility (one of: 'Eligible', 'Likely Eligible', 'Need More Information', 'Not Eligible')
    - reason (a simple explanation of why they qualify or what is missing. CRITICAL: Translate this explanation into the language code ${lang})
    
    Return ONLY the JSON array. Do not wrap in markdown \`\`\`json.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up potential markdown formatting from Gemini
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let matches = [];
    if (text) {
       const parsed = JSON.parse(text);
       matches = parsed.matches || parsed;
       if (!Array.isArray(matches) && typeof matches === 'object') {
         matches = Object.values(matches).find(val => Array.isArray(val)) || [];
       }
    }

    const populatedMatches = matches.map((match: any) => {
      const scheme = mockSchemes.find(s => s.id === match.schemeId);
      return {
        ...scheme,
        matchDetails: match
      };
    }).filter((s: any) => s.id);

    return NextResponse.json({ matches: populatedMatches });
  } catch (error) {
    console.error('Error in match-schemes API:', error);
    return NextResponse.json({ error: 'Failed to match schemes' }, { status: 500 });
  }
}
