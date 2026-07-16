import type { ArchiveCycle } from "./archive";
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
  /** Historique revisitable des contenus générés par notion/étape. */
  readonly archive: ArchiveCycle | null;
}

export interface ResumeSession {
  readonly objectif: Objectif;
  readonly statut: StatutSession;
  readonly miseAJour: string;
  readonly notionsTotal: number;
  readonly notionsMaitrisees: number;
}
