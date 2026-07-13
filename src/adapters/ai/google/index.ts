import { createGoogleGenerativeAI } from "@ai-sdk/google";

export function creerModeleGoogle(modeleId: string) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "Clé API Google manquante. Ajoutez GOOGLE_GENERATIVE_AI_API_KEY dans votre fichier .env.local",
    );
  }

  const google = createGoogleGenerativeAI({ apiKey });
  return google(modeleId);
}
