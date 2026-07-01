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
    const result = await chat.sendMessage(lastMessage);
    const responseText = result.response.text();

    return NextResponse.json({ reply: responseText });
    
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process chat: ' + (error instanceof Error ? error.message : String(error)) }, 
      { status: 500 }
    );
  }
}
