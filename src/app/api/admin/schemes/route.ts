import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const schemes = await prisma.scheme.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ schemes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      category,
      central_or_state,
      applicable_states,
      description,
      benefits,
      required_documents,
      application_link,
      offline_process,
      nearest_office,
      tags,
      target_gender,
      target_occupations,
      min_age,
      max_age,
      income_limit,
      is_student_only,
      is_farmer_only,
      is_pregnant_only,
      is_senior_only,
      is_daily_wage_only,
      is_bpl_only
    } = body;

    if (!id || !name) {
      return NextResponse.json({ error: 'ID and Name are required' }, { status: 400 });
    }

    const scheme = await prisma.scheme.create({
      data: {
        id,
        name,
        category,
        central_or_state,
        applicable_states: applicable_states || ['All'],
        description: description || '',
        benefits: benefits || '',
        required_documents: required_documents || ['Aadhaar Card'],
        application_link: application_link || null,
        offline_process: offline_process || null,
        nearest_office: nearest_office || null,
        tags: tags || [category.toLowerCase()],
        target_gender: target_gender || 'All',
        target_occupations: target_occupations || ['All'],
        min_age: min_age !== undefined && min_age !== null && min_age !== '' ? parseInt(min_age, 10) : null,
        max_age: max_age !== undefined && max_age !== null && max_age !== '' ? parseInt(max_age, 10) : null,
        income_limit: income_limit !== undefined && income_limit !== null && income_limit !== '' ? parseFloat(income_limit) : null,
        is_student_only: !!is_student_only,
        is_farmer_only: !!is_farmer_only,
        is_pregnant_only: !!is_pregnant_only,
        is_senior_only: !!is_senior_only,
        is_daily_wage_only: !!is_daily_wage_only,
        is_bpl_only: !!is_bpl_only,
      }
    });

    return NextResponse.json({ scheme });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const updated = await prisma.scheme.update({
      where: { id },
      data: {
        ...data,
        min_age: data.min_age !== undefined && data.min_age !== null && data.min_age !== '' ? parseInt(data.min_age, 10) : null,
        max_age: data.max_age !== undefined && data.max_age !== null && data.max_age !== '' ? parseInt(data.max_age, 10) : null,
        income_limit: data.income_limit !== undefined && data.income_limit !== null && data.income_limit !== '' ? parseFloat(data.income_limit) : null,
      }
    });

    return NextResponse.json({ scheme: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 });
    }

    await prisma.scheme.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
