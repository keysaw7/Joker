import type {
  AnalyseReponse,
  ContexteApprentissage,
  Correction,
  Exercice,
  FeedbackItem,
} from "@/core/domain";

/** Produit une explication personnalisée à partir de l'analyse d'une réponse. */
export interface Correcteur {
  corriger(
    contexte: ContexteApprentissage,
    exercice: Exercice,
    analyse: AnalyseReponse,
    items?: readonly FeedbackItem[],
  ): Promise<Correction>;
}
