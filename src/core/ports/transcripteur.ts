export interface BriefTranscription {
  readonly audio: Uint8Array;
  readonly mediaType: string;
  readonly langue?: string;
}

export interface ResultatTranscription {
  readonly texte: string;
}

/** Convertit un enregistrement audio en texte (STT). */
export interface Transcripteur {
  transcrire(brief: BriefTranscription): Promise<ResultatTranscription>;
}
