export interface BriefGenerationImage {
  readonly brief: string;
  readonly contexte?: string;
}

export interface ResultatGenerationImage {
  readonly bytes: Uint8Array;
  readonly mediaType: string;
  readonly alt: string;
}

/**
 * Génère des images pédagogiques à partir d'un brief.
 * Implémentations : OpenAI Image, Google Imagen, mock.
 */
export interface GenerateurImage {
  genererImage(brief: BriefGenerationImage): Promise<ResultatGenerationImage>;
}
