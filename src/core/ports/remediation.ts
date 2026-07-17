import type {
  ContexteApprentissage,
  Exercice,
  FormatExercice,
  Notion,
} from "@/core/domain";

/**
 * Génère un exercice ciblant précisément un point bloquant identifié.
 * Le cycle continue jusqu'à disparition de la difficulté.
 */
export interface Remediation {
  genererExerciceCible(
    contexte: ContexteApprentissage,
    notion: Notion,
    lacune: string,
    format: FormatExercice,
  ): Promise<Exercice>;
}