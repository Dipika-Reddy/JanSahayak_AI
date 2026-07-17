import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CSVRow {
  [key: string]: string;
}

// Resilient helper to extract values from varying CSV headers
function getVal(row: CSVRow, keys: string[]): string {
  for (const k of keys) {
    if (row[k] !== undefined) return row[k].trim();
    const lowerKey = k.toLowerCase();
    const foundKey = Object.keys(row).find(rk => rk.toLowerCase() === lowerKey);
    if (foundKey && row[foundKey] !== undefined) return row[foundKey].trim();
  }
  return '';
}

// Generate URL slug from title for unique IDs
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function run() {
  const csvFilePath = path.join(process.cwd(), 'schemes.csv');
  if (!fs.existsSync(csvFilePath)) {
    console.error(`Error: 'schemes.csv' not found at ${csvFilePath}.`);
    console.log('========================================================================');
    console.log('INSTRUCTIONS:');
    console.log('1. Download the Kaggle "Indian Government Schemes" dataset:');
    console.log('   https://www.kaggle.com/datasets/jainamgada45/indian-government-schemes');
    console.log('2. Rename the downloaded CSV to "schemes.csv".');
    console.log('3. Put the file in the project root folder (c:\\Users\\dipik\\Desktop\\JanSahayak_AI\\).');
    console.log('4. Run: npx tsx prisma/import-csv.ts');
    console.log('========================================================================');
    process.exit(1);
  }

  console.log('Parsing schemes.csv and importing to Supabase...');
  const schemesToInsert: any[] = [];
  
  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row: CSVRow) => {
      const name = getVal(row, ['Scheme Name', 'scheme_name', 'name', 'title']);
      const description = getVal(row, ['Scheme Description', 'scheme_description', 'description', 'details']);
      const benefits = getVal(row, ['Benefits', 'scheme_benefits', 'benefit']);
      const category = getVal(row, ['Category', 'scheme_category', 'sector']) || 'General';
      const stateVal = getVal(row, ['State', 'scheme_state', 'applicable_state', 'state_name']);
      const requiredDocsText = getVal(row, ['Required Documents', 'Documents Required', 'documents', 'required_documents']);
      const applicationLink = getVal(row, ['Application Link', 'Link', 'url', 'source_url']);
      const eligibilityText = getVal(row, ['Eligibility Criteria', 'Eligibility', 'eligibility_criteria']);
      
      if (!name) return; // Skip invalid rows

      const id = slugify(name);
      
      // Determine state/central applicability
      let applicable_states = ['All'];
      let central_or_state = 'Central';
      if (stateVal && stateVal.toLowerCase() !== 'all' && stateVal.toLowerCase() !== 'central' && stateVal.toLowerCase() !== 'national') {
        applicable_states = [stateVal];
        central_or_state = 'State';
      }

      // Parse required documents list
      let required_documents: string[] = [];
      if (requiredDocsText) {
        required_documents = requiredDocsText
          .split(/[,;\n\u2022\u00b7]/)
          .map(d => d.trim().replace(/^-\s*/, ''))
          .filter(d => d.length > 2);
      }
      if (required_documents.length === 0) {
        required_documents = ['Aadhaar Card', 'Income Certificate', 'Resident Proof'];
      }

      // Parse tags
      const tags = [category.toLowerCase(), central_or_state.toLowerCase()].filter(Boolean);
      
      // Search keywords in details to extract target parameters
      const fullText = `${description} ${eligibilityText} ${name}`.toLowerCase();
      
      let target_gender = 'All';
      if (fullText.includes('female') || fullText.includes('women') || fullText.includes('girl')) {
        target_gender = 'Female';
      } else if (fullText.includes('male') || fullText.includes('men')) {
        target_gender = 'Male';
      }

      let is_farmer_only = false;
      const farmerKeywords = ['farmer', 'agriculture', 'cultivator', 'crop', 'sowing', 'fertilizer', 'kisan'];
      if (farmerKeywords.some(kw => fullText.includes(kw))) {
        is_farmer_only = true;
      }

      let is_student_only = false;
      const studentKeywords = ['student', 'school', 'college', 'scholarship', 'education', 'matric', 'university'];
      if (studentKeywords.some(kw => fullText.includes(kw))) {
        is_student_only = true;
      }

      let is_pregnant_only = false;
      if (fullText.includes('pregnant') || fullText.includes('maternity') || fullText.includes('lactating') || fullText.includes('delivery')) {
        is_pregnant_only = true;
      }

      let is_senior_only = false;
      if (fullText.includes('senior citizen') || fullText.includes('elderly') || fullText.includes('old age') || fullText.includes('pensioner') || fullText.includes('60 years')) {
        is_senior_only = true;
      }

      let is_daily_wage_only = false;
      if (fullText.includes('daily wage') || fullText.includes('labourer') || fullText.includes('worker') || fullText.includes('artisan') || fullText.includes('unorganized')) {
        is_daily_wage_only = true;
      }

      let is_bpl_only = false;
      if (fullText.includes('bpl') || fullText.includes('below poverty line') || fullText.includes('poor') || fullText.includes('marginalized') || fullText.includes('ration card')) {
        is_bpl_only = true;
      }

      const target_occupations: string[] = [];
      if (is_farmer_only) target_occupations.push('Farmer', 'Agriculture');
      if (is_student_only) target_occupations.push('Student');
      if (is_daily_wage_only) target_occupations.push('Daily Wage Labourer');
      if (target_occupations.length === 0) target_occupations.push('All');

      let min_age = null;
      let max_age = null;
      if (is_senior_only) min_age = 60;
      if (is_student_only) max_age = 25;

      schemesToInsert.push({
        id,
        name,
        category,
        central_or_state,
        applicable_states,
        description: description || name,
        benefits: benefits || 'Benefits as per schemes rules and local guidelines.',
        required_documents,
        application_link: applicationLink || null,
        offline_process: null,
        nearest_office: null,
        tags,
        target_gender,
        target_occupations,
        min_age,
        max_age,
        income_limit: is_bpl_only ? 150000 : null,
        is_student_only,
        is_farmer_only,
        is_pregnant_only,
        is_senior_only,
        is_daily_wage_only,
        is_bpl_only
      });
    })
    .on('end', async () => {
      console.log(`Parsed ${schemesToInsert.length} schemes from CSV.`);
      
      // Deduplicate by slug ID
      const uniqueSchemes = Array.from(new Map(schemesToInsert.map(s => [s.id, s])).values());
      console.log(`Deduplicated to ${uniqueSchemes.length} unique schemes.`);

      console.log('Writing records to Supabase in parallel batches...');
      let inserted = 0;
      const chunkSize = 50;
      
      for (let i = 0; i < uniqueSchemes.length; i += chunkSize) {
        const chunk = uniqueSchemes.slice(i, i + chunkSize);
        await Promise.all(
          chunk.map(async (scheme) => {
            try {
              await prisma.scheme.upsert({
                where: { id: scheme.id },
                update: {
                  name: scheme.name,
                  category: scheme.category,
                  central_or_state: scheme.central_or_state,
                  applicable_states: scheme.applicable_states,
                  description: scheme.description,
                  benefits: scheme.benefits,
                  required_documents: scheme.required_documents,
                  application_link: scheme.application_link,
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
                },
                create: scheme
              });
              inserted++;
            } catch (dbError) {
              console.error(`Failed to insert scheme: ${scheme.name}`, dbError);
            }
          })
        );
        console.log(`Progress: Synced [${Math.min(i + chunkSize, uniqueSchemes.length)}/${uniqueSchemes.length}] schemes.`);
      }
      
      console.log(`Successfully completed CSV import. Synced ${inserted} schemes on Supabase.`);
      await prisma.$disconnect();
    });
}

run().catch(err => {
  console.error('ETL Ingestion Pipeline error:', err);
  prisma.$disconnect();
});
