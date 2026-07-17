import {
  SELECTION_DEFAUT,
  SELECTION_DEFAUT_TRANSCRIPTION,
  normaliserSelection,
} from "@/adapters/ai/fournisseurs";
import { creerTranscripteur } from "@/adapters/ai/transcription";

export async function transcrireAudioServeur(
  audio: Uint8Array,
  mediaType: string,
  langue?: string,
): Promise<string> {
  const selection =
    SELECTION_DEFAUT.fournisseur === "mock"
      ? { fournisseur: "mock" as const, modele: "mock" }
      : normaliserSelection(SELECTION_DEFAUT_TRANSCRIPTION);

  const transcripteur = creerTranscripteur(selection);
  const { texte } = await transcripteur.transcrire({
    audio,
    mediaType,
    langue,
  });
  return texte;
}
