import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { messages, context, lang } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Valid messages array is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    // Retrieve last user message for semantic retrieval
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
    let semanticSchemes = [];
    
    if (lastUserMessage) {
      try {
        const embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
        const embedResult = await embeddingModel.embedContent({
          content: { role: 'user', parts: [{ text: lastUserMessage }] },
          outputDimensionality: 768
        } as any);
        const embedding = embedResult.embedding.values;
        const vectorString = `[${embedding.join(',')}]`;

        // Query top 4 semantically matching schemes using pgvector cosine distance
        const dbResults: any = await prisma.$queryRaw`
          SELECT 
            "id", "name", "category", "description", "benefits", "required_documents"
          FROM "Scheme"
          WHERE "embedding" IS NOT NULL
          ORDER BY "embedding" <=> ${vectorString}::vector
          LIMIT 4
        `;
        semanticSchemes = dbResults;
      } catch (embedError) {
        console.error('Semantic search failed in chat API:', embedError);
      }
    }
    
    const systemPrompt = `
    You are JanSahayak AI, a helpful Indian Government Welfare Voice Assistant.
    Your job is to act as an intent parser, response generator, and profile extractor for a voice interface.
    
    You MUST output valid JSON only, using this exact schema:
    {
      "intent": "READ_ALL" | "READ_SCHEME" | "READ_BENEFITS" | "READ_DOCS" | "READ_STEPS" | "NEXT" | "PREV" | "STOP" | "PAUSE" | "RESUME" | "REPEAT" | "GENERAL_CHAT",
      "targetSchemeId": "The ID of the specific scheme the user is asking about, if applicable, otherwise null",
      "acknowledgment": "A very short (1-4 words) system acknowledgment to display in the chat UI (e.g. 'Reading details...'). MUST BE TRANSLATED TO: ${lang}",
      "spokenResponse": "The actual detailed content to be spoken aloud. This must contain the requested info (benefits, docs, etc.) about the target scheme or a friendly follow-up question. MUST BE FULLY TRANSLATED TO: ${lang}. NEVER mix English and the target language unless it's a proper noun.",
      "extractedProfileDiff": {
        "age": "number or null",
        "gender": "Female | Male | Other | null",
        "occupation": "Farmer | Student | Daily Wage Labourer | Unemployed | null",
        "state": "string (e.g. Andhra Pradesh, Karnataka, Telangana, etc.) or null",
        "income": "number or null",
        "pregnant": "boolean or null",
        "farmer": "boolean or null",
        "student": "boolean or null",
        "seniorCitizen": "boolean or null",
        "dailyWageWorker": "boolean or null",
        "bpl": "boolean or null"
      }
    }

    Context about the user:
    - User Profile: ${JSON.stringify(context?.profile, null, 2)}
    - Rule-matched schemes (schemes they explicitly qualify for based on rules): ${JSON.stringify(context?.schemes, null, 2)}
    - Semantically relevant schemes (retrieved based on semantic meaning/relevance to user statement): ${JSON.stringify(semanticSchemes, null, 2)}
    
    CRITICAL INSTRUCTIONS:
    1. If the user asks about a specific scheme (e.g., "Tell me about PM-Kisan"), find the matching scheme in the context, set intent to READ_SCHEME, set targetSchemeId, and put the translated details in spokenResponse.
    2. If the user asks for "benefits", set intent to READ_BENEFITS, targetSchemeId, and put the translated benefits in spokenResponse.
    3. If the user asks for "documents", set intent to READ_DOCS, targetSchemeId, and put the translated documents list in spokenResponse.
    4. If the user uses a control command ("next", "stop", "read all"), set the corresponding intent. The spokenResponse can be short.
    5. The 'acknowledgment' is strictly for the text UI, it should be very short.
    6. Ensure EVERY string in 'acknowledgment' and 'spokenResponse' is strictly in the requested language code: ${lang}.
    7. Progressive Profile Building / Eligibility Interview:
       - Inspect the user's current 'profile' in the context.
       - If key parameters are missing (e.g., 'state', 'occupation', 'age', 'gender'), formulate a natural, single conversational follow-up question in 'spokenResponse' to collect them (e.g., "Could you please tell me which state you are from?" or "What is your occupation?").
       - When the user answers and provides any profile fields in their message, extract those fields into 'extractedProfileDiff' so they can be saved, and acknowledge them in 'spokenResponse' (e.g. "Understood, you are a student. Do you reside in Telangana?").
       - Do not ask for more than one piece of information at a time. Make the interaction feel like a friendly, helpful dialogue.
    `;

    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: '{"intent":"GENERAL_CHAT", "targetSchemeId":null, "acknowledgment":"Understood.", "spokenResponse":"Understood.", "extractedProfileDiff":null}' }] },
        ...formattedMessages.slice(0, -1)
      ],
    });

    const lastMessage = formattedMessages[formattedMessages.length - 1].parts[0].text;
    
    let responseText = "";
    let parsedResponse = null;
    let attempt = 0;
    const maxRetries = 3;

    while (attempt < maxRetries) {
      try {
        const result = await chat.sendMessage(lastMessage);
        responseText = result.response.text();
        parsedResponse = JSON.parse(responseText);
        break; // Success
      } catch (error: any) {
        attempt++;
        const is503 = error?.message?.includes('503') || error?.status === 503;
        const isRateLimit = error?.message?.includes('429') || error?.status === 429;
        
        console.warn(`[Gemini Chat API] Attempt ${attempt} failed:`, error.message);
        
        if (attempt >= maxRetries || (!is503 && !isRateLimit && !(error instanceof SyntaxError))) {
          throw error;
        }
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(res => setTimeout(res, delay));
      }
    }

    if (!parsedResponse) {
       throw new Error("Failed to parse JSON response from AI");
    }

    return NextResponse.json(parsedResponse);
    
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process chat: ' + (error instanceof Error ? error.message : String(error)) }, 
      { status: 500 }
    );
  }
}
