import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Sleep helper to stay within API rate limits
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('Fetching schemes from database that do not have embeddings yet...');
  
  // Use raw query because 'embedding' is defined as Unsupported in Prisma
  const schemesToEmbed: any[] = await prisma.$queryRaw`
    SELECT "id", "name", "category", "description", "benefits", "tags"
    FROM "Scheme"
    WHERE "embedding" IS NULL
  `;
  
  if (schemesToEmbed.length === 0) {
    console.log('All schemes in the database already have embeddings. Nothing to do.');
    return;
  }

  console.log(`Generating embeddings for ${schemesToEmbed.length} schemes using gemini-embedding-001...`);
  const embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

  let successCount = 0;
  for (let i = 0; i < schemesToEmbed.length; i++) {
    const scheme = schemesToEmbed[i];
    try {
      // Create a rich text representation of the scheme
      const textToEmbed = `
        Scheme Name: ${scheme.name}
        Category: ${scheme.category}
        Description: ${scheme.description}
        Benefits: ${scheme.benefits}
        Tags: ${Array.isArray(scheme.tags) ? (scheme.tags as string[]).join(', ') : scheme.tags}
      `.trim();

      const result = await embeddingModel.embedContent({
        content: { role: 'user', parts: [{ text: textToEmbed }] },
        outputDimensionality: 768
      } as any);
      
      const embedding = result.embedding.values; // Array of 768 numbers

      if (!embedding || embedding.length !== 768) {
        throw new Error(`Invalid embedding length generated: ${embedding?.length}`);
      }

      // Store the embedding in the Unsupported vector column using raw SQL
      const vectorString = `[${embedding.join(',')}]`;
      await prisma.$executeRawUnsafe(
        `UPDATE "Scheme" SET "embedding" = $1::vector WHERE "id" = $2`,
        vectorString,
        scheme.id
      );

      successCount++;
      if (successCount % 10 === 0 || i === schemesToEmbed.length - 1) {
        console.log(`Progress: [${i + 1}/${schemesToEmbed.length}] ✓ Embedded ${successCount} schemes.`);
      }

      // Delay 150ms to respect rate limit (approx. 400 RPM)
      await sleep(150);

    } catch (err: any) {
      console.error(`❌ Failed to embed scheme [${scheme.name}]:`, err.message);
      // Wait longer on error to let rate limit cool down
      await sleep(2000);
    }
  }

  console.log(`Vector embedding generation complete. Successfully embedded ${successCount} schemes.`);
}

main()
  .catch(err => {
    console.error('Embedding script error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
