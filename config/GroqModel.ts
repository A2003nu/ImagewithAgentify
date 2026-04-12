import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.warn("GROQ_API_KEY is not set. Groq client may not work properly.");
}

export const groq = new Groq({
  apiKey: apiKey || "",
});