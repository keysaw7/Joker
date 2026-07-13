import { createAnthropic } from "@ai-sdk/anthropic";

export function creerModeleAnthropic(modeleId: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "Clé API Anthropic manquante. Ajoutez ANTHROPIC_API_KEY dans votre fichier .env.local",
    );
  }

  const anthropic = createAnthropic({ apiKey });
  return anthropic(modeleId);
}
