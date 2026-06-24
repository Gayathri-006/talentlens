const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// All models confirmed available for this API key, in priority order
const MODEL_PRIORITY = [
  "gemini-2.0-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash",
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(err) {
  const msg = err?.message || "";
  return (
    msg.includes("503") ||
    msg.includes("overloaded") ||
    msg.includes("high demand") ||
    err?.status === 503
  );
}

function isQuotaError(err) {
  const msg = err?.message || "";
  return (
    msg.includes("429") ||
    msg.includes("quota") ||
    msg.includes("Too Many Requests") ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    err?.status === 429
  );
}

function extractRetryDelay(err) {
  // Try to parse retryDelay from the error message e.g. "Please retry in 5.9s"
  const match = (err?.message || "").match(/retry in (\d+(?:\.\d+)?)s/i);
  if (match) return Math.ceil(parseFloat(match[1])) * 1000 + 500;
  return 6000; // default 6s
}

async function tryModel(modelName, prompt) {
  // Attempt the model once with retry only for 503 (not 429 — quota won't recover in seconds)
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
      return JSON.parse(cleaned);
    } catch (err) {
      if (isRetryableError(err) && attempt === 1) {
        const delay = 3000;
        console.warn(
          `[Gemini] ${modelName} busy, retrying in ${delay}ms...`
        );
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }
}

async function generateJSON(prompt) {
  let lastError;
  const skippedQuota = [];

  for (const modelName of MODEL_PRIORITY) {
    try {
      console.log(`[Gemini] Trying model: ${modelName}`);
      const result = await tryModel(modelName, prompt);
      console.log(`[Gemini] Success with model: ${modelName}`);
      return result;
    } catch (err) {
      lastError = err;

      if (isQuotaError(err)) {
        // Daily/per-minute quota hit — move to next model immediately
        console.warn(
          `[Gemini] ${modelName} quota exceeded, trying next model...`
        );
        skippedQuota.push(modelName);
        continue;
      }

      if (isRetryableError(err)) {
        // Still unavailable after retry — try next model
        console.warn(
          `[Gemini] ${modelName} still unavailable, trying next model...`
        );
        continue;
      }

      // Any other error (auth failure, bad request, etc.) — fail immediately
      throw err;
    }
  }

  // All models failed
  console.error(
    `[Gemini] All models failed. Quota-exceeded models: ${skippedQuota.join(", ")}. Last error: ${lastError?.message}`
  );

  if (skippedQuota.length === MODEL_PRIORITY.length) {
    throw new Error(
      "AI analysis quota has been reached for today. Please try again tomorrow or upgrade your Gemini API plan."
    );
  }

  throw new Error(
    "AI analysis is temporarily unavailable. Please try again in a few minutes."
  );
}

module.exports = {
  generateJSON,
};
