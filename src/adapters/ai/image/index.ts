import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { generateImage } from "ai";
import type {
  BriefGenerationImage,
  GenerateurImage,
  ResultatGenerationImage,
} from "@/core/ports";
import type { SelectionModele } from "../fournisseurs";

function decoderImage(
  image: { base64?: string; uint8Array?: Uint8Array; mediaType?: string },
  alt: string,
): ResultatGenerationImage {
  if (image.uint8Array) {
    return {
      bytes: image.uint8Array,
      mediaType: image.mediaType ?? "image/png",
      alt,
    };
  }
  if (image.base64) {
    const bytes = Uint8Array.from(Buffer.from(image.base64, "base64"));
    return {
      bytes,
      mediaType: image.mediaType ?? "image/png",
      alt,
    };
  }
  throw new Error("Aucune donnée image retournée par le modèle.");
}

/** Crée un générateur d'images branché sur OpenAI ou Google Imagen. */
export function creerGenerateurImage(selection: SelectionModele): GenerateurImage {
  return {
    async genererImage({ brief, contexte }: BriefGenerationImage): Promise<ResultatGenerationImage> {
      const prompt = contexte
        ? `Contexte pédagogique : ${contexte}\n\nIllustration à générer : ${brief}`
        : brief;

      const alt = brief.slice(0, 120);

      if (selection.fournisseur === "openai") {
        const apiKey = process.env.OPENAI_API_KEY?.trim();
        if (!apiKey) {
          throw new Error("Clé API OpenAI manquante pour la génération d'images.");
        }
        const openai = createOpenAI({ apiKey });
        const resultat = await generateImage({
          model: openai.image(selection.modele),
          prompt,
        });
        return decoderImage(resultat.image, alt);
      }

      if (selection.fournisseur === "google") {
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
        if (!apiKey) {
          throw new Error("Clé API Google manquante pour la génération d'images.");
        }
        const google = createGoogleGenerativeAI({ apiKey });
        const resultat = await generateImage({
          model: google.image(selection.modele),
          prompt,
        });
        return decoderImage(resultat.image, alt);
      }

      throw new Error(
        `Fournisseur « ${selection.fournisseur} » non supporté pour la génération d'images.`,
      );
    },
  };
}
