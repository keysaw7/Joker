import type {
  ContexteApprentissage,
  ProfilApprenant,
  QuestionDiagnostic,
} from "@/core/domain";

/**
 * Construit une représentation fidèle du niveau réel de l'élève.
 * Les questions sont générées dynamiquement — jamais fixes.
 */
export interface Diagnostic {
  genererQuestion(contexte: ContexteApprentissage): Promise<QuestionDiagnostic>;
  estTermine(contexte: ContexteApprentissage): Promise<boolean>;
  construireProfil(contexte: ContexteApprentissage): Promise<ProfilApprenant>;
}
