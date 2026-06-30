import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const prompt = `
    You are an AI assistant that extracts user profiles from text. 
    Extract the following fields if present: age, gender, occupation, state, district, disability, category, farmer status, income, marital status, pregnant.
    Return ONLY a JSON object with the extracted keys and values. If a field is not mentioned, omit it from the JSON.
    Do not wrap the JSON in Markdown formatting like \`\`\`json. Just return the raw JSON object.

    Text:
    "${transcript}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up potential markdown formatting from Gemini
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const profile = text ? JSON.parse(text) : {};

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error in extract-profile API:', error);
    return NextResponse.json({ error: 'Failed to extract profile' }, { status: 500 });
  }
}
