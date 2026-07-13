import type { ContexteApprentissage } from "./contexte";
import type { QuestionDiagnostic } from "./profil";

/** Phase du parcours d'apprentissage (diagnostic ou prêt pour le Cycle). */
export type PhaseParcours = "diagnostic" | "pret";

/** État géré par l'orchestrateur du parcours. */
export interface EtatParcours {
  readonly contexte: ContexteApprentissage;
  readonly phase: PhaseParcours;
  /** Question courante pendant le diagnostic ; null quand prêt. */
  readonly questionCourante: QuestionDiagnostic | null;
}
