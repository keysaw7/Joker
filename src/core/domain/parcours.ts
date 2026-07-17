import type { ContexteApprentissage } from "./contexte";
import type {
  DifficulteDiagnostic,
  MaitriseDiagnostic,
  QuestionDiagnostic,
} from "./profil";

/** Phase du parcours d'apprentissage (diagnostic ou prêt pour le Cycle). */
export type PhaseParcours = "diagnostic" | "pret";

export interface EntreeHistoriqueDiagnostic {
  readonly difficulte: DifficulteDiagnostic;
  readonly maitrise: MaitriseDiagnostic;
}

/** État géré par l'orchestrateur du parcours. */
export interface EtatParcours {
  readonly contexte: ContexteApprentissage;
  readonly phase: PhaseParcours;
  /** Question en cours pendant le diagnostic ; null quand prêt. */
  readonly questionCourante: QuestionDiagnostic | null;
  readonly questionsPosees: number;
  readonly historiqueMaitrise: readonly EntreeHistoriqueDiagnostic[];
}
