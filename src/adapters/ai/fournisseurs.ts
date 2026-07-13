export type IdFournisseur = "mock" | "anthropic" | "openai" | "google";

export type CategorieModele =
  | "texte"
  | "raisonnement"
  | "multimodal"
  | "recherche"
  | "code"
  | "image"
  | "audio"
  | "transcription"
  | "embedding"
  | "video"
  | "agent"
  | "open";

export interface ModeleFournisseur {
  readonly id: string;
  readonly nom: string;
  readonly categorie: CategorieModele;
}

export interface FournisseurIA {
  readonly id: IdFournisseur;
  readonly nom: string;
  readonly modeles: readonly ModeleFournisseur[];
}

export interface SelectionModele {
  readonly fournisseur: IdFournisseur;
  readonly modele: string;
}

export const LIBELLES_CATEGORIE: Record<CategorieModele, string> = {
  texte: "Texte",
  raisonnement: "Raisonnement",
  multimodal: "Multimodal",
  recherche: "Recherche",
  code: "Code",
  image: "Image",
  audio: "Audio / TTS",
  transcription: "Transcription",
  embedding: "Embedding",
  video: "Vidéo",
  agent: "Agent",
  open: "Open source",
};

export const ORDRE_CATEGORIES: readonly CategorieModele[] = [
  "texte",
  "raisonnement",
  "multimodal",
  "recherche",
  "code",
  "image",
  "audio",
  "transcription",
  "embedding",
  "video",
  "agent",
  "open",
];

export const FOURNISSEURS: readonly FournisseurIA[] = [
  {
    id: "mock",
    nom: "Mock (hors ligne)",
    modeles: [{ id: "mock", nom: "Développement hors ligne", categorie: "texte" }],
  },
  {
    id: "anthropic",
    nom: "Anthropic",
    modeles: [
      { id: "claude-sonnet-5", nom: "Claude Sonnet 5", categorie: "texte" },
      { id: "claude-opus-4-8", nom: "Claude Opus 4.8", categorie: "texte" },
      { id: "claude-opus-4-7", nom: "Claude Opus 4.7", categorie: "texte" },
      { id: "claude-sonnet-4-6", nom: "Claude Sonnet 4.6", categorie: "texte" },
      { id: "claude-opus-4-6", nom: "Claude Opus 4.6", categorie: "texte" },
      { id: "claude-sonnet-4-5", nom: "Claude Sonnet 4.5", categorie: "texte" },
      { id: "claude-opus-4-5", nom: "Claude Opus 4.5", categorie: "texte" },
      { id: "claude-haiku-4-5", nom: "Claude Haiku 4.5", categorie: "texte" },
      { id: "claude-fable-5", nom: "Claude Fable 5 (narratif)", categorie: "texte" },
      { id: "claude-sonnet-4", nom: "Claude Sonnet 4", categorie: "texte" },
      { id: "claude-opus-4-1", nom: "Claude Opus 4.1", categorie: "texte" },
      { id: "claude-3-haiku-20240307", nom: "Claude 3 Haiku", categorie: "texte" },
    ],
  },
  {
    id: "openai",
    nom: "OpenAI",
    modeles: [
      // Texte
      { id: "gpt-5.6-terra", nom: "GPT-5.6 Terra", categorie: "texte" },
      { id: "gpt-5.6-sol", nom: "GPT-5.6 Sol", categorie: "texte" },
      { id: "gpt-5.6-luna", nom: "GPT-5.6 Luna", categorie: "texte" },
      { id: "gpt-5.5", nom: "GPT-5.5", categorie: "texte" },
      { id: "gpt-5.4-pro", nom: "GPT-5.4 Pro", categorie: "texte" },
      { id: "gpt-5.4", nom: "GPT-5.4", categorie: "texte" },
      { id: "gpt-5.4-mini", nom: "GPT-5.4 Mini", categorie: "texte" },
      { id: "gpt-5.4-nano", nom: "GPT-5.4 Nano", categorie: "texte" },
      { id: "gpt-5.2-pro", nom: "GPT-5.2 Pro", categorie: "texte" },
      { id: "gpt-5.2", nom: "GPT-5.2", categorie: "texte" },
      { id: "gpt-5.1", nom: "GPT-5.1", categorie: "texte" },
      { id: "gpt-5", nom: "GPT-5", categorie: "texte" },
      { id: "gpt-5-mini", nom: "GPT-5 Mini", categorie: "texte" },
      { id: "gpt-5-nano", nom: "GPT-5 Nano", categorie: "texte" },
      { id: "gpt-5-chat-latest", nom: "GPT-5 Chat (latest)", categorie: "texte" },
      { id: "gpt-5.1-chat-latest", nom: "GPT-5.1 Chat (latest)", categorie: "texte" },
      { id: "gpt-5.2-chat-latest", nom: "GPT-5.2 Chat (latest)", categorie: "texte" },
      { id: "gpt-5.3-chat-latest", nom: "GPT-5.3 Chat (latest)", categorie: "texte" },
      { id: "gpt-4.1", nom: "GPT-4.1", categorie: "texte" },
      { id: "gpt-4.1-mini", nom: "GPT-4.1 Mini", categorie: "texte" },
      { id: "gpt-4.1-nano", nom: "GPT-4.1 Nano", categorie: "texte" },
      { id: "gpt-4o", nom: "GPT-4o", categorie: "texte" },
      { id: "gpt-4o-mini", nom: "GPT-4o Mini", categorie: "texte" },
      // Raisonnement
      { id: "o3", nom: "o3", categorie: "raisonnement" },
      { id: "o3-mini", nom: "o3-mini", categorie: "raisonnement" },
      { id: "o4-mini", nom: "o4-mini", categorie: "raisonnement" },
      { id: "o1", nom: "o1", categorie: "raisonnement" },
      // Multimodal
      { id: "gpt-4o-audio-preview", nom: "GPT-4o Audio (preview)", categorie: "multimodal" },
      { id: "gpt-4o-mini-audio-preview", nom: "GPT-4o Mini Audio (preview)", categorie: "multimodal" },
      // Recherche
      { id: "gpt-4o-search-preview", nom: "GPT-4o Search (preview)", categorie: "recherche" },
      { id: "gpt-4o-mini-search-preview", nom: "GPT-4o Mini Search (preview)", categorie: "recherche" },
      // Code
      { id: "gpt-5.1-codex-max", nom: "GPT-5.1 Codex Max", categorie: "code" },
      { id: "gpt-5.1-codex", nom: "GPT-5.1 Codex", categorie: "code" },
      { id: "gpt-5.1-codex-mini", nom: "GPT-5.1 Codex Mini", categorie: "code" },
      { id: "gpt-5.2-codex", nom: "GPT-5.2 Codex", categorie: "code" },
      { id: "gpt-5.3-codex", nom: "GPT-5.3 Codex", categorie: "code" },
      { id: "gpt-5-codex", nom: "GPT-5 Codex", categorie: "code" },
      // Image
      { id: "gpt-image-2", nom: "GPT Image 2", categorie: "image" },
      { id: "gpt-image-1.5", nom: "GPT Image 1.5", categorie: "image" },
      { id: "gpt-image-1", nom: "GPT Image 1", categorie: "image" },
      { id: "gpt-image-1-mini", nom: "GPT Image 1 Mini", categorie: "image" },
      { id: "chatgpt-image-latest", nom: "ChatGPT Image (latest)", categorie: "image" },
      { id: "dall-e-3", nom: "DALL·E 3", categorie: "image" },
      { id: "dall-e-2", nom: "DALL·E 2", categorie: "image" },
      // Audio / TTS
      { id: "gpt-4o-mini-tts", nom: "GPT-4o Mini TTS", categorie: "audio" },
      { id: "tts-1-hd", nom: "TTS-1 HD", categorie: "audio" },
      { id: "tts-1", nom: "TTS-1", categorie: "audio" },
      // Transcription
      { id: "gpt-4o-transcribe-diarize", nom: "GPT-4o Transcribe Diarize", categorie: "transcription" },
      { id: "gpt-4o-transcribe", nom: "GPT-4o Transcribe", categorie: "transcription" },
      { id: "gpt-4o-mini-transcribe", nom: "GPT-4o Mini Transcribe", categorie: "transcription" },
      { id: "whisper-1", nom: "Whisper", categorie: "transcription" },
    ],
  },
  {
    id: "google",
    nom: "Google",
    modeles: [
      // Texte
      { id: "gemini-3.5-flash", nom: "Gemini 3.5 Flash", categorie: "texte" },
      { id: "gemini-3.1-pro-preview", nom: "Gemini 3.1 Pro (preview)", categorie: "texte" },
      { id: "gemini-3.1-flash-lite-preview", nom: "Gemini 3.1 Flash Lite (preview)", categorie: "texte" },
      { id: "gemini-3-pro-preview", nom: "Gemini 3 Pro (preview)", categorie: "texte" },
      { id: "gemini-3-flash-preview", nom: "Gemini 3 Flash (preview)", categorie: "texte" },
      { id: "gemini-2.5-pro", nom: "Gemini 2.5 Pro", categorie: "texte" },
      { id: "gemini-2.5-flash", nom: "Gemini 2.5 Flash", categorie: "texte" },
      { id: "gemini-2.5-flash-lite", nom: "Gemini 2.5 Flash Lite", categorie: "texte" },
      { id: "gemini-2.0-flash", nom: "Gemini 2.0 Flash", categorie: "texte" },
      { id: "gemini-pro-latest", nom: "Gemini Pro (latest)", categorie: "texte" },
      { id: "gemini-flash-latest", nom: "Gemini Flash (latest)", categorie: "texte" },
      { id: "gemini-flash-lite-latest", nom: "Gemini Flash Lite (latest)", categorie: "texte" },
      // Multimodal
      {
        id: "gemini-2.5-flash-native-audio-latest",
        nom: "Gemini 2.5 Flash Native Audio (latest)",
        categorie: "multimodal",
      },
      {
        id: "gemini-2.5-flash-native-audio-preview-12-2025",
        nom: "Gemini 2.5 Flash Native Audio (preview)",
        categorie: "multimodal",
      },
      // Recherche
      {
        id: "deep-research-max-preview-04-2026",
        nom: "Deep Research Max (preview)",
        categorie: "recherche",
      },
      {
        id: "deep-research-pro-preview-12-2025",
        nom: "Deep Research Pro (preview)",
        categorie: "recherche",
      },
      {
        id: "deep-research-preview-04-2026",
        nom: "Deep Research (preview)",
        categorie: "recherche",
      },
      { id: "aqa", nom: "Attributed Question Answering", categorie: "recherche" },
      // Image
      { id: "imagen-4.0-ultra-generate-001", nom: "Imagen 4 Ultra", categorie: "image" },
      { id: "imagen-4.0-generate-001", nom: "Imagen 4", categorie: "image" },
      { id: "imagen-4.0-fast-generate-001", nom: "Imagen 4 Fast", categorie: "image" },
      { id: "gemini-3.1-flash-image-preview", nom: "Gemini 3.1 Flash Image (preview)", categorie: "image" },
      { id: "gemini-3-pro-image-preview", nom: "Gemini 3 Pro Image (preview)", categorie: "image" },
      { id: "gemini-2.5-flash-image", nom: "Gemini 2.5 Flash Image", categorie: "image" },
      { id: "nano-banana-pro-preview", nom: "Nano Banana Pro (preview)", categorie: "image" },
      // Audio / TTS
      { id: "gemini-3.1-flash-tts-preview", nom: "Gemini 3.1 Flash TTS (preview)", categorie: "audio" },
      { id: "gemini-2.5-pro-preview-tts", nom: "Gemini 2.5 Pro TTS (preview)", categorie: "audio" },
      { id: "gemini-2.5-flash-preview-tts", nom: "Gemini 2.5 Flash TTS (preview)", categorie: "audio" },
      // Embedding
      { id: "gemini-embedding-2", nom: "Gemini Embedding 2", categorie: "embedding" },
      { id: "gemini-embedding-2-preview", nom: "Gemini Embedding 2 (preview)", categorie: "embedding" },
      { id: "gemini-embedding-001", nom: "Gemini Embedding 001", categorie: "embedding" },
      // Vidéo
      { id: "veo-3.1-generate-001", nom: "Veo 3.1", categorie: "video" },
      { id: "veo-3.1-fast-generate-001", nom: "Veo 3.1 Fast", categorie: "video" },
      { id: "veo-3.0-generate-001", nom: "Veo 3.0", categorie: "video" },
      { id: "veo-3.0-fast-generate-001", nom: "Veo 3.0 Fast", categorie: "video" },
      // Agent
      {
        id: "gemini-3.1-pro-preview-customtools",
        nom: "Gemini 3.1 Pro Custom Tools (preview)",
        categorie: "agent",
      },
      {
        id: "gemini-2.5-computer-use-preview-10-2025",
        nom: "Gemini 2.5 Computer Use (preview)",
        categorie: "agent",
      },
      { id: "gemini-robotics-er-1.5-preview", nom: "Gemini Robotics ER 1.5 (preview)", categorie: "agent" },
      // Open source (Gemma)
      { id: "gemma-3-27b-it", nom: "Gemma 3 27B", categorie: "open" },
      { id: "gemma-3-12b-it", nom: "Gemma 3 12B", categorie: "open" },
      { id: "gemma-3-4b-it", nom: "Gemma 3 4B", categorie: "open" },
      { id: "gemma-3-1b-it", nom: "Gemma 3 1B", categorie: "open" },
      { id: "gemma-3n-e4b-it", nom: "Gemma 3n E4B", categorie: "open" },
      { id: "gemma-3n-e2b-it", nom: "Gemma 3n E2B", categorie: "open" },
    ],
  },
] as const;

export const SELECTION_DEFAUT: SelectionModele = {
  fournisseur: "openai",
  modele: "gpt-5-nano",
};

export function trouverFournisseur(id: IdFournisseur): FournisseurIA | undefined {
  return FOURNISSEURS.find((f) => f.id === id);
}

export function modeleValide(selection: SelectionModele): boolean {
  const fournisseur = trouverFournisseur(selection.fournisseur);
  if (!fournisseur) return false;
  return fournisseur.modeles.some((m) => m.id === selection.modele);
}

export function normaliserSelection(selection: SelectionModele): SelectionModele {
  if (modeleValide(selection)) return selection;

  const fournisseur = trouverFournisseur(selection.fournisseur) ?? FOURNISSEURS[0]!;
  return {
    fournisseur: fournisseur.id,
    modele: fournisseur.modeles[0]!.id,
  };
}

export function grouperModelesParCategorie(
  modeles: readonly ModeleFournisseur[],
): { categorie: CategorieModele; libelle: string; modeles: ModeleFournisseur[] }[] {
  const groupes = new Map<CategorieModele, ModeleFournisseur[]>();

  for (const modele of modeles) {
    const liste = groupes.get(modele.categorie) ?? [];
    liste.push(modele);
    groupes.set(modele.categorie, liste);
  }

  return ORDRE_CATEGORIES.flatMap((categorie) => {
    const liste = groupes.get(categorie);
    if (!liste?.length) return [];
    return [{ categorie, libelle: LIBELLES_CATEGORIE[categorie], modeles: liste }];
  });
}
