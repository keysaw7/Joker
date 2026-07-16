import type { SpecGraphique } from "@/core/domain";

export interface BriefGenerationGraphique {
  readonly brief: string;
  readonly contexte?: string;
}

/**
 * Génère une spécification de graphique (données structurées) à partir d'un brief.
 */
export interface GenerateurGraphique {
  genererGraphique(brief: BriefGenerationGraphique): Promise<SpecGraphique>;
}
