import { PrismaClient } from '@prisma/client';
import { mockSchemes } from '../src/lib/mock-schemes';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Supabase database with schemes...');
  
  // Clear existing schemes to prevent duplicates
  await prisma.scheme.deleteMany({});
  
  for (const scheme of mockSchemes) {
    await prisma.scheme.create({
      data: {
        id: scheme.id,
        name: scheme.name,
        category: scheme.category,
        central_or_state: scheme.central_or_state,
        applicable_states: scheme.applicable_states,
        description: scheme.description,
        benefits: scheme.benefits,
        required_documents: scheme.required_documents,
        application_link: scheme.application_link,
        offline_process: scheme.offline_process,
        nearest_office: scheme.nearest_office,
        tags: scheme.tags,
        target_gender: scheme.target_gender,
        target_occupations: scheme.target_occupations,
        min_age: scheme.min_age,
        max_age: scheme.max_age,
        income_limit: scheme.income_limit,
        is_student_only: scheme.is_student_only,
        is_farmer_only: scheme.is_farmer_only,
        is_pregnant_only: scheme.is_pregnant_only,
        is_senior_only: scheme.is_senior_only,
        is_daily_wage_only: scheme.is_daily_wage_only,
        is_bpl_only: scheme.is_bpl_only,
      }
    });
  }

  console.log(`Seeding complete. Inserted ${mockSchemes.length} schemes.`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
