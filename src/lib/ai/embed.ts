import { embed } from "ai";
import { google, EMBEDDING_MODEL, EMBEDDING_DIM } from "./google";

export async function embedText(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: google.embedding(EMBEDDING_MODEL),
    value: text,
    providerOptions: {
      google: { outputDimensionality: EMBEDDING_DIM },
    },
  });
  return embedding;
}
