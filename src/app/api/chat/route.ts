import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { messages, context, lang } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Valid messages array is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const systemPrompt = `
    You are JanSahayak AI, a helpful Indian Government Welfare Assistant.
    You help users understand government schemes they are eligible for.
    Always reply in the requested language code: ${lang}
    Keep your answers highly concise, clear, and easy to understand for someone with low digital literacy.
    If asked to "read all schemes" or "read next", concisely list out the benefits of the recommended schemes.
    
    Context about the user and their matched schemes:
    ${JSON.stringify(context, null, 2)}
    `;

    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood.' }] },
        ...formattedMessages.slice(0, -1)
      ],
    });

    const lastMessage = formattedMessages[formattedMessages.length - 1].parts[0].text;
    
    let responseText = "";
    let attempt = 0;
    const maxRetries = 3;

    while (attempt < maxRetries) {
      try {
        const result = await chat.sendMessage(lastMessage);
        responseText = result.response.text();
        break; // Success
      } catch (error: any) {
        attempt++;
        const is503 = error?.message?.includes('503') || error?.status === 503;
        const isRateLimit = error?.message?.includes('429') || error?.status === 429;
        
        console.warn(`[Gemini Chat API] Attempt ${attempt} failed:`, error.message);
        
        if (attempt >= maxRetries || (!is503 && !isRateLimit)) {
          throw error;
        }
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(res => setTimeout(res, delay));
      }
    }

    return NextResponse.json({ reply: responseText });
    
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process chat: ' + (error instanceof Error ? error.message : String(error)) }, 
      { status: 500 }
    );
  }
}
