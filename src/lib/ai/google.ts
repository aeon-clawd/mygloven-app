import { createGoogleGenerativeAI } from "@ai-sdk/google";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!apiKey) {
  // Don't throw at import time — let the route fail with a clear message
  // instead of crashing the build / dev server boot.
  console.warn(
    "[ai/google] GOOGLE_GENERATIVE_AI_API_KEY is not set. " +
      "Chat and embedding endpoints will return 500 until it's added to .env.local."
  );
}

export const google = createGoogleGenerativeAI({ apiKey: apiKey ?? "" });

export const CHAT_MODEL = "gemini-2.5-flash";
export const EMBEDDING_MODEL = "gemini-embedding-001";
export const EMBEDDING_DIM = 768;
