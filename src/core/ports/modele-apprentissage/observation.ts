import type {
  AnalyseReponse,
  EvaluationDiagnostic,
  Exercice,
  Observation,
  QuestionDiagnostic,
} from "@/core/domain";

export interface ContexteObservationDiagnostic {
  readonly eleveId: string;
  readonly objectifId: string;
  readonly sessionId?: string;
  /** IDs stables déjà résolus (registre). */
  readonly noeudIds: readonly string[];
}

export interface ContexteObservationExercice {
  readonly eleveId: string;
  readonly objectifId: string;
  readonly notionId: string;
  readonly sessionId?: string;
  readonly noeudIds: readonly string[];
}

export interface SignalComportemental {
  readonly type:
    | "utilisation_indice"
    | "abandon"
    | "temps_reflexion"
    | "confiance_declaree"
    | "preference_format"
    | "revision"
    | "oubli_detecte";
  readonly eleveId: string;
  readonly noeudIds: readonly string[];
  readonly objectifId?: string;
  readonly notionId?: string;
  readonly sessionId?: string;
  readonly exerciceId?: string;
  readonly questionId?: string;
  readonly dureeMs?: number;
  readonly confiance?: number;
  readonly format?: string;
  readonly succes?: boolean;
  readonly intensite?: number;
}

/**
 * Normalise les événements bruts des orchestrateurs en Observations validées.
 */
export interface MoteurObservation {
  depuisEvaluationDiagnostic(
    question: QuestionDiagnostic,
    evaluation: EvaluationDiagnostic,
    contexte: ContexteObservationDiagnostic,
  ): Observation;

  depuisReponseExercice(
    exercice: Exercice,
    analyse: AnalyseReponse,
    contexte: ContexteObservationExercice,
  ): Observation[];

  depuisSignalComportemental(signal: SignalComportemental): Observation;
}
