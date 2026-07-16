export interface BriefGenerationSchema {
  readonly brief: string;
  readonly contexte?: string;
}

export interface ResultatGenerationSchema {
  readonly mermaid: string;
}

/**
 * Génère du code Mermaid pour schémas et diagrammes pédagogiques.
 */
export interface GenerateurSchema {
  genererSchema(brief: BriefGenerationSchema): Promise<ResultatGenerationSchema>;
}
