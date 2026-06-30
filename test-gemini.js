const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test(modelName) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Say hello");
    console.log(modelName, "SUCCESS:", result.response.text());
  } catch (e) {
    console.log(modelName, "FAILED:", e.message);
  }
}

async function run() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    const flashModels = data.models.filter(m => m.name.includes('flash')).map(m => m.name);
    console.log(flashModels);
  } catch (e) {
    console.error(e);
  }
}

run();
