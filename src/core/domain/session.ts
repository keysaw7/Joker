import type { EtatCycle } from "./cycle";
import type { Objectif } from "./objectif";
import type { EtatParcours } from "./parcours";

export type StatutSession = "diagnostic" | "generation" | "cycle" | "termine";

export interface SessionPersistee {
  readonly objectif: Objectif;
  readonly statut: StatutSession;
  readonly miseAJour: string;
  readonly etatParcours: EtatParcours | null;
  readonly etatCycle: EtatCycle | null;
}

export interface ResumeSession {
  readonly objectif: Objectif;
  readonly statut: StatutSession;
  readonly miseAJour: string;
  readonly notionsTotal: number;
  readonly notionsMaitrisees: number;
}
