import type {
  ContexteApprentissage,
  DifficulteDiagnostic,
  EstimationNiveau,
  EvaluationDiagnostic,
  ProfilApprenant,
  QuestionDiagnostic,
  ReponseDiagnostic,
} from "@/core/domain";

export interface ParametresQuestionDiagnostic {
  readonly difficulteCible: DifficulteDiagnostic;
  readonly competencesDejaCouvertes: readonly string[];
  readonly estimation: EstimationNiveau | null;
}

/**
 * Construit une représentation fidèle du niveau réel de l'élève.
 * Questions adaptatives : une à la fois selon les évaluations précédentes.
 */
export interface Diagnostic {
  genererQuestion(
    contexte: ContexteApprentissage,
    params: ParametresQuestionDiagnostic,
  ): Promise<QuestionDiagnostic>;

  evaluerReponse(
    contexte: ContexteApprentissage,
    question: QuestionDiagnostic,
    reponse: ReponseDiagnostic,
  ): Promise<EvaluationDiagnostic>;

  construireProfil(contexte: ContexteApprentissage): Promise<ProfilApprenant>;
}
