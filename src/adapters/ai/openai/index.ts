import { createOpenAI } from "@ai-sdk/openai";

export function creerModeleOpenAI(modeleId: string) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "Clé API OpenAI manquante. Ajoutez OPENAI_API_KEY dans votre fichier .env.local",
    );
  }

  const openai = createOpenAI({ apiKey });
  return openai(modeleId);
}
