import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Helper to call Gemini models with automatic retries and fallback
 * to gracefully handle 503 Service Unavailable (high demand) errors.
 */
export async function generateContentWithRetry(prompt: string, config: any = {}, maxRetries = 3) {
  let attempt = 0;
  
  // Try preferred model, fallback to 1.5-flash if all retries fail
  const modelsToTry = [
    config.model || "gemini-2.5-flash",
    "gemini-1.5-pro",
    "gemini-pro"
  ];

  for (const modelName of modelsToTry) {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: config.generationConfig
    });

    attempt = 0;
    while (attempt < maxRetries) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (error: any) {
        attempt++;
        const is503 = error?.message?.includes('503') || error?.status === 503;
        const isRateLimit = error?.message?.includes('429') || error?.status === 429;
        const is404 = error?.message?.includes('404') || error?.status === 404;
        
        console.warn(`[Gemini API] Attempt ${attempt} failed for ${modelName}:`, error.message);
        
        // If it's a 429 Rate Limit/Quota Exceeded, or 404 Not Found instantly switch to fallback model
        if ((isRateLimit || is404) && modelName !== modelsToTry[modelsToTry.length - 1]) {
          console.warn(`[Gemini API] Error on ${modelName}, switching to fallback instantly.`);
          break; // Break the while loop to move to the next model in the outer for loop
        }

        if (attempt >= maxRetries) {
          if (modelName === modelsToTry[modelsToTry.length - 1]) {
            throw error; // All models and retries failed
          }
          break; // Move to the fallback model
        }
        
        // Only retry on 503 Service Unavailable
        if (is503) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`[Gemini API] Retrying in ${delay}ms...`);
          await new Promise(res => setTimeout(res, delay));
        } else if (modelName !== modelsToTry[modelsToTry.length - 1]) {
           break; // If it's an unretryable error but we have fallbacks, switch to fallback
        } else {
          throw error; // Not a retryable error and no fallbacks left
        }
      }
    }
  }
  throw new Error("Failed to generate content after all retries and fallbacks");
}
