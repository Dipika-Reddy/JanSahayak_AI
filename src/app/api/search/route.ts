import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Scheme } from '@/lib/mock-schemes';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limitParam = searchParams.get('limit');
    
    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const limit = limitParam ? parseInt(limitParam, 10) : 5;

    // 1. Generate embedding for user query
    const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
    const embedResult = await model.embedContent({
      content: { role: 'user', parts: [{ text: query }] },
      outputDimensionality: 768
    } as any);
    
    const embedding = embedResult.embedding.values;
    const vectorString = `[${embedding.join(',')}]`;

    // 2. Perform Cosine Similarity query via pgvector on Supabase Postgres
    const matchedSchemes: any = await prisma.$queryRaw`
      SELECT 
        "id", 
        "name", 
        "category", 
        "central_or_state", 
        "applicable_states", 
        "description", 
        "benefits", 
        "required_documents", 
        "application_link", 
        "offline_process", 
        "nearest_office", 
        "tags", 
        "target_gender", 
        "target_occupations", 
        "min_age", 
        "max_age", 
        "income_limit", 
        "is_student_only", 
        "is_farmer_only", 
        "is_pregnant_only", 
        "is_senior_only", 
        "is_daily_wage_only", 
        "is_bpl_only",
        1 - ("embedding" <=> ${vectorString}::vector) AS "similarity"
      FROM "Scheme"
      WHERE "embedding" IS NOT NULL
      ORDER BY "similarity" DESC
      LIMIT ${limit}
    `;

    // 3. Format results to match the frontend Scheme interface
    const results: (Scheme & { similarity: number })[] = matchedSchemes.map((s: any) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      central_or_state: s.central_or_state,
      applicable_states: s.applicable_states as string[],
      description: s.description,
      benefits: s.benefits,
      required_documents: s.required_documents as string[],
      application_link: s.application_link,
      offline_process: s.offline_process,
      nearest_office: s.nearest_office,
      tags: s.tags as string[],
      target_gender: s.target_gender,
      target_occupations: s.target_occupations as string[],
      min_age: s.min_age,
      max_age: s.max_age,
      income_limit: s.income_limit,
      is_student_only: s.is_student_only,
      is_farmer_only: s.is_farmer_only,
      is_pregnant_only: s.is_pregnant_only,
      is_senior_only: s.is_senior_only,
      is_daily_wage_only: s.is_daily_wage_only,
      is_bpl_only: s.is_bpl_only,
      similarity: Number(s.similarity)
    }));

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      { error: 'Failed to process semantic search: ' + error.message },
      { status: 500 }
    );
  }
}
