import type {
  AnalyseReponse,
  ContexteApprentissage,
  Correction,
  Exercice,
} from "@/core/domain";

/** Produit une explication personnalisée à partir de l'analyse d'une réponse. */
export interface Correcteur {
  corriger(
    contexte: ContexteApprentissage,
    exercice: Exercice,
    analyse: AnalyseReponse,
  ): Promise<Correction>;
}
