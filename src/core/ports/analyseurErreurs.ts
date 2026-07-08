import type {
  AnalyseReponse,
  ContexteApprentissage,
  Exercice,
  ReponseApprenant,
} from "@/core/domain";

/**
 * Identifie lacunes, confusions et erreurs cognitives
 * à partir d'une réponse de l'élève.
 */
export interface AnalyseurErreurs {
  analyser(
    contexte: ContexteApprentissage,
    exercice: Exercice,
    reponse: ReponseApprenant,
  ): Promise<AnalyseReponse>;
}
