import type { ContenuEtape, EtapeCycle } from "./cycle";
import type { Correction } from "./exercice";

/** Échange élève ↔ correction lors d'une session d'exercices. */
export interface EchangeExercice {
  readonly enonce: string;
  readonly reponse: string;
  readonly correction?: Correction;
}

/** Contenu archivé pour une étape du cycle. */
export interface EtapeArchivee {
  readonly etape: EtapeCycle;
  readonly contenu: ContenuEtape;
}

/** Historique complet d'une notion (revisitable). */
export interface NotionArchivee {
  readonly notionId: string;
  readonly titre: string;
  readonly etapes: readonly EtapeArchivee[];
  readonly echangesExercice: readonly EchangeExercice[];
  readonly maitrisee: boolean;
}

/** Archive globale du parcours d'apprentissage. */
export interface ArchiveCycle {
  readonly notions: readonly NotionArchivee[];
}
