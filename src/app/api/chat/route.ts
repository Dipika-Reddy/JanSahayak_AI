import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

function extractEntitiesFromText(text: string): any {
  const diff: any = {};
  const lower = text.toLowerCase();

  // Age extraction (e.g., "20 year old", "age is 20", "20 yrs")
  const ageMatch = lower.match(/(?:age\s*(?:is|=|:)?\s*(\d{1,2}))|(?:(\d{1,2})\s*(?:years|yrs|year|yr))/);
  if (ageMatch) {
    diff.age = parseInt(ageMatch[1] || ageMatch[2], 10);
  }

  // Income extraction (e.g., "1,00,000", "100000", "1 lakh", "90k")
  const incomeMatch = lower.match(/(?:income\s*(?:is|=|:)?\s*(?:rs\.?|₹)?\s*([\d,]+(?:\.\d+)?)\s*(k|lakhs?|lakh)?)|(?:([\d,]+)\s*(?:lakhs?|lakh))/);
  if (incomeMatch) {
    let raw = (incomeMatch[1] || incomeMatch[3]).replace(/,/g, '');
    let val = parseFloat(raw);
    const unit = (incomeMatch[2] || '').toLowerCase();
    if (unit === 'k') val *= 1000;
    if (unit.startsWith('lakh')) val *= 100000;
    diff.income = val;
  } else {
    const rawNumMatch = lower.match(/(?:income|salary|earning|earns|family income)\D*([\d,]{4,9})/);
    if (rawNumMatch) {
      diff.income = parseFloat(rawNumMatch[1].replace(/,/g, ''));
    }
  }

  // State extraction
  const stateKeywords: Record<string, string> = {
    'telangana': 'Telangana',
    'andhra pradesh': 'Andhra Pradesh',
    'andhra': 'Andhra Pradesh',
    'ap': 'Andhra Pradesh',
    'karnataka': 'Karnataka',
    'tamil nadu': 'Tamil Nadu',
    'maharashtra': 'Maharashtra',
    'kerala': 'Kerala',
    'gujarat': 'Gujarat',
    'punjab': 'Punjab',
    'haryana': 'Haryana',
    'rajasthan': 'Rajasthan',
    'uttar pradesh': 'Uttar Pradesh',
    'madhya pradesh': 'Madhya Pradesh',
    'bihar': 'Bihar',
    'west bengal': 'West Bengal',
    'delhi': 'Delhi',
  };
  for (const [kw, name] of Object.entries(stateKeywords)) {
    if (new RegExp(`\\b${kw}\\b`, 'i').test(lower)) {
      diff.state = name;
      break;
    }
  }

  // Marital Status extraction
  if (/\bwidow\b|\bwidowed\b/.test(lower)) {
    diff.maritalStatus = 'Widow';
    diff.occupation = null;
    diff.student = false;
  } else if (/\bmarried\b/.test(lower)) {
    diff.maritalStatus = 'Married';
  } else if (/\bsingle\b|\bunmarried\b/.test(lower)) {
    diff.maritalStatus = 'Single';
  }

  // Occupation extraction
  if (/\bstudent\b|\bcollege\b|\bschool\b|\buniversity\b|\bdegree\b|\bdiploma\b/.test(lower)) {
    diff.occupation = 'Student';
    diff.student = true;
  } else if (/\bfarmer\b|\bkisan\b|\bagriculture\b/.test(lower)) {
    diff.occupation = 'Farmer';
    diff.farmer = true;
  } else if (/\bdaily wage\b|\blabour\b|\blaborer\b|\bworker\b/.test(lower)) {
    diff.occupation = 'Daily Wage Labourer';
    diff.dailyWageWorker = true;
  } else if (/\bunemployed\b/.test(lower)) {
    diff.occupation = 'Unemployed';
  }

  // Gender extraction
  if (/\bfemale\b|\bwoman\b|\bwomen\b|\bgirl\b/.test(lower)) {
    diff.gender = 'Female';
  } else if (/\bmale\b|\bman\b|\bmen\b|\bboy\b/.test(lower)) {
    diff.gender = 'Male';
  }

  // Category extraction
  if (/\bobc\b/.test(lower)) diff.category = 'OBC';
  else if (/\bsc\b/.test(lower)) diff.category = 'SC';
  else if (/\bst\b/.test(lower)) diff.category = 'ST';
  else if (/\bgeneral\b/.test(lower)) diff.category = 'General';

  // Disability extraction
  if (/\bdisabled\b|\bdisability\b|\bhandicapped\b|\bpwd\b/.test(lower)) {
    diff.disability = true;
  }

  return diff;
}

// Generate intelligent follow-up question strictly obeying field priority
function generateFollowUpResponse(mergedProfile: any): string {
  const hasAge = mergedProfile.age !== null && mergedProfile.age !== undefined;
  const hasIncome = mergedProfile.income !== null && mergedProfile.income !== undefined;
  const hasGender = Boolean(mergedProfile.gender);
  const hasCategory = Boolean(mergedProfile.category);
  const hasDisability = mergedProfile.disability !== null && mergedProfile.disability !== undefined;
  const hasOccupation = Boolean(mergedProfile.occupation || mergedProfile.student || mergedProfile.farmer);
  const hasMaritalStatus = Boolean(mergedProfile.maritalStatus);
  const hasState = Boolean(mergedProfile.state);

  // If age AND income are present (or full details), NEVER ask for age or income!
  if (hasAge && hasIncome) {
    return "I found schemes matching your profile. Here are your eligible schemes.";
  }

  // Priority 1: Age
  if (!hasAge) {
    return "To find more accurate schemes, please tell me your age or annual family income.";
  }

  // Priority 2: Income
  if (!hasIncome) {
    return "To check income eligibility, please share your annual family income.";
  }

  // Priority 3: Gender
  if (!hasGender) {
    return "Could you please specify your gender?";
  }

  // Priority 4: Category
  if (!hasCategory) {
    return "What is your social category (e.g., General, OBC, SC, ST)?";
  }

  // Priority 5: Disability
  if (!hasDisability) {
    return "Do you have any disability status?";
  }

  // Default fallback
  return "I found schemes matching your profile. Here are your eligible schemes.";
}

export async function POST(req: Request) {
  let messages: any[] = [];
  let context: any = {};
  try {
    const body = await req.json();
    messages = body.messages || [];
    context = body.context || {};
    const lang = body.lang || 'en-IN';

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Valid messages array is required' }, { status: 400 });
    }

    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop()?.content || '';

    // Step 1: Extract entities from ALL user messages to form complete context
    let aggregateExtracted: any = {};
    messages.filter((m: any) => m.role === 'user').forEach((m: any) => {
      const parsed = extractEntitiesFromText(m.content || '');
      aggregateExtracted = { ...aggregateExtracted, ...parsed };
    });

    const currentExtracted = extractEntitiesFromText(lastUserMessage);
    const mergedProfile = { ...context?.profile, ...aggregateExtracted, ...currentExtracted };

    // Step 2: Determine appropriate follow-up question
    const defaultSpokenResponse = generateFollowUpResponse(mergedProfile);

    const systemPrompt = `
    You are JanSahayak AI, a helpful Indian Government Welfare Voice Assistant.
    Your job is to act as an intent parser, response generator, and profile extractor for a voice interface.

    CRITICAL FOLLOW-UP RULES:
    - User merged profile: ${JSON.stringify(mergedProfile, null, 2)}
    - If user provided age and income: DO NOT ASK FOR AGE OR INCOME AGAIN! Use: "${defaultSpokenResponse}"
    - Recommended spoken response: "${defaultSpokenResponse}"
    
    You MUST output valid JSON only, using this exact schema:
    {
      "intent": "READ_ALL" | "READ_SCHEME" | "READ_BENEFITS" | "READ_DOCS" | "READ_STEPS" | "NEXT" | "PREV" | "STOP" | "PAUSE" | "RESUME" | "REPEAT" | "GENERAL_CHAT",
      "targetSchemeId": "The ID of the specific scheme the user is asking about, if applicable, otherwise null",
      "acknowledgment": "A short acknowledgment in ${lang}",
      "spokenResponse": "The actual response content in ${lang}.",
      "extractedProfileDiff": {
        "age": "number or null",
        "gender": "Female | Male | Other | null",
        "occupation": "Farmer | Student | Daily Wage Labourer | Unemployed | null",
        "maritalStatus": "Widow | Married | Single | null",
        "state": "string or null",
        "income": "number or null",
        "category": "General | OBC | SC | ST | null",
        "disability": "boolean or null",
        "student": "boolean or null",
        "farmer": "boolean or null"
      }
    }
    `;

    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-2.0-flash-exp", "gemini-1.5-pro"];
    let parsedResponse: any = null;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: { responseMimeType: "application/json" }
        });

        const formattedMessages = messages.map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        }));

        const chat = model.startChat({
          history: [
            { role: 'user', parts: [{ text: systemPrompt }] },
            { role: 'model', parts: [{ text: `{"intent":"GENERAL_CHAT", "targetSchemeId":null, "acknowledgment":"Understood.", "spokenResponse":"${defaultSpokenResponse}", "extractedProfileDiff":null}` }] },
            ...formattedMessages.slice(0, -1)
          ],
        });

        const result = await chat.sendMessage(lastUserMessage);
        const responseText = result.response.text();
        parsedResponse = JSON.parse(responseText);

        // Enforce deterministic follow-up rule if Gemini hallucinated asking for age/income
        if (parsedResponse) {
          const hasAge = mergedProfile.age !== null && mergedProfile.age !== undefined;
          const hasIncome = mergedProfile.income !== null && mergedProfile.income !== undefined;
          if (hasAge && hasIncome) {
            parsedResponse.spokenResponse = defaultSpokenResponse;
          }
          break;
        }
      } catch (err: any) {
        console.warn(`[Gemini Chat API] Model ${modelName} failed:`, err.message);
      }
    }

    if (parsedResponse) {
      parsedResponse.extractedProfileDiff = {
        ...(parsedResponse.extractedProfileDiff || {}),
        ...currentExtracted,
      };
      return NextResponse.json(parsedResponse);
    }

    return NextResponse.json({
      intent: "GENERAL_CHAT",
      targetSchemeId: null,
      acknowledgment: "Understood.",
      spokenResponse: defaultSpokenResponse,
      extractedProfileDiff: Object.keys(currentExtracted).length > 0 ? currentExtracted : null
    });

  } catch (error) {
    console.error('Error in chat API, using resilient fallback profile extractor:', error);

    const lastMsg = (messages.filter((m: any) => m.role === 'user').pop()?.content || '');
    const currentExtracted = extractEntitiesFromText(lastMsg);
    const mergedProfile = { ...context?.profile, ...currentExtracted };
    const defaultSpokenResponse = generateFollowUpResponse(mergedProfile);

    return NextResponse.json({
      intent: "GENERAL_CHAT",
      targetSchemeId: null,
      acknowledgment: "Understood.",
      spokenResponse: defaultSpokenResponse,
      extractedProfileDiff: Object.keys(currentExtracted).length > 0 ? currentExtracted : null
    });
  }
}
