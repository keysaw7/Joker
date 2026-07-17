import type { DifficulteDiagnostic, MaitriseDiagnostic } from "../profil";
import type { NiveauGuidage } from "../exercice";

/**
 * Unité atomique d'évidence. Append-only : on n'écrase jamais le passé.
 * Nouveaux types = extension sans casser l'architecture.
 */
export type TypeObservation =
  | "reponse_diagnostic"
  | "reponse_exercice"
  | "utilisation_indice"
  | "abandon"
  | "temps_reflexion"
  | "confiance_declaree"
  | "revision"
  | "preference_format"
  | "oubli_detecte";

export type SourceObservation = "diagnostic" | "cycle" | "ui" | "systeme";

export interface MetaObservation {
  readonly sessionId?: string;
  readonly objectifId?: string;
  readonly notionId?: string;
  readonly source: SourceObservation;
}

export interface PreuveReponseDiagnostic {
  readonly type: "reponse_diagnostic";
  readonly questionId: string;
  readonly maitrise: MaitriseDiagnostic;
  readonly difficulte: DifficulteDiagnostic;
  readonly lacuneDetectee?: string;
}

export interface PreuveReponseExercice {
  readonly type: "reponse_exercice";
  readonly exerciceId: string;
  readonly correcte: boolean;
  readonly guidage: NiveauGuidage;
  readonly connaissanceManquante?: string;
  readonly confusion?: string;
  readonly erreurCognitive?: string;
}

export interface PreuveUtilisationIndice {
  readonly type: "utilisation_indice";
  readonly exerciceId: string;
}

export interface PreuveAbandon {
  readonly type: "abandon";
  readonly exerciceId?: string;
  readonly dureeMs?: number;
}

export interface PreuveTempsReflexion {
  readonly type: "temps_reflexion";
  readonly dureeMs: number;
  readonly exerciceId?: string;
  readonly questionId?: string;
}

export interface PreuveConfianceDeclaree {
  readonly type: "confiance_declaree";
  /** Confiance déclarée ∈ [0, 1]. */
  readonly confiance: number;
  readonly exerciceId?: string;
}

export interface PreuveRevision {
  readonly type: "revision";
  readonly succes: boolean;
}

export interface PreuvePreferenceFormat {
  readonly type: "preference_format";
  readonly format: string;
  readonly succes: boolean;
}

export interface PreuveOubliDetecte {
  readonly type: "oubli_detecte";
  /** Force relative de l'oubli observé ∈ (0, 1]. */
  readonly intensite: number;
}

export type PreuveObservation =
  | PreuveReponseDiagnostic
  | PreuveReponseExercice
  | PreuveUtilisationIndice
  | PreuveAbandon
  | PreuveTempsReflexion
  | PreuveConfianceDeclaree
  | PreuveRevision
  | PreuvePreferenceFormat
  | PreuveOubliDetecte;

export interface Observation {
  readonly id: string;
  readonly eleveId: string;
  readonly type: TypeObservation;
  readonly horodatage: string;
  /** Compétences / notions ciblées (IDs stables du graphe). */
  readonly noeudIds: readonly string[];
  readonly preuve: PreuveObservation;
  readonly meta: MetaObservation;
}
