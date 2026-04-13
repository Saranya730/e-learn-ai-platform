const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Preferred chat models (Groq-safe list)
const PREFERRED_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.2-70b-chat",
  "llama-3.2-8b-chat",
  "llama-3.1-8b-chat",
];

async function getSupportedModelName() {
  const response = await groq.models.list();

  const availableModels = response.data.map(m => m.id);
  console.log("Groq available models:", availableModels);

  // Pick first matching preferred model
  for (const model of PREFERRED_MODELS) {
    if (availableModels.includes(model)) {
      return model;
    }
  }

  // Fallback: pick any NON-restricted chat model
  const safeFallback = availableModels.find(
    m =>
      m.includes("chat") &&
      !m.includes("audio") &&
      !m.includes("speech") &&
      !m.includes("vision") &&
      !m.includes("orpheus")
  );

  if (!safeFallback) {
    throw new Error("No supported Groq chat model available");
  }

  return safeFallback;
}

module.exports = { getSupportedModelName };