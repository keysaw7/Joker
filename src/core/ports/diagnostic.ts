import type {
  ContexteApprentissage,
  ProfilApprenant,
  QuestionDiagnostic,
} from "@/core/domain";

/**
 * Construit une représentation fidèle du niveau réel de l'élève.
 * Les questions sont générées en lot au démarrage du diagnostic.
 */
export interface Diagnostic {
  genererQuestions(contexte: ContexteApprentissage): Promise<readonly QuestionDiagnostic[]>;
  construireProfil(contexte: ContexteApprentissage): Promise<ProfilApprenant>;
}
