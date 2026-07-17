import { createOpenAI } from "@ai-sdk/openai";
import { transcribe } from "ai";
import type {
  BriefTranscription,
  ResultatTranscription,
  Transcripteur,
} from "@/core/ports";
import type { SelectionModele } from "../fournisseurs";

export function creerTranscripteurMock(): Transcripteur {
  return {
    async transcrire(): Promise<ResultatTranscription> {
      return { texte: "[transcription mock]" };
    },
  };
}

export function creerTranscripteur(selection: SelectionModele): Transcripteur {
  if (selection.fournisseur === "mock") {
    return creerTranscripteurMock();
  }

  if (selection.fournisseur === "openai") {
    return {
      async transcrire(brief: BriefTranscription): Promise<ResultatTranscription> {
        const apiKey = process.env.OPENAI_API_KEY?.trim();
        if (!apiKey) {
          throw new Error("Clé API OpenAI manquante pour la transcription.");
        }
        const openai = createOpenAI({ apiKey });
        const langue = brief.langue ?? "fr";
        const resultat = await transcribe({
          model: openai.transcription(selection.modele),
          audio: brief.audio,
          providerOptions: {
            openai: {
              language: langue,
            },
          },
        });
        return { texte: resultat.text.trim() };
      },
    };
  }

  throw new Error(
    `Fournisseur « ${selection.fournisseur} » non supporté pour la transcription.`,
  );
}
