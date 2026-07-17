/**
 * Le diagnostic ne cherche pas à attribuer une note affichée à l'élève.
 * Il construit une représentation fidèle du niveau réel via un signal structuré.
 * Les questions sont générées dynamiquement (adaptatif).
 */
export type DifficulteDiagnostic = 1 | 2 | 3 | 4 | 5;

export type MaitriseDiagnostic = "maitrise" | "partiel" | "absent";

export interface QuestionDiagnostic {
  readonly id: string;
  readonly intitule: string;
  readonly competenceId: string;
  readonly competenceLibelle: string;
  readonly difficulte: DifficulteDiagnostic;
}

export interface ReponseDiagnostic {
  readonly questionId: string;
  readonly reponse: string;
}

export interface EvaluationDiagnostic {
  readonly questionId: string;
  readonly maitrise: MaitriseDiagnostic;
  readonly justification: string;
  readonly lacuneDetectee?: string;
}

export interface CompetenceEstimee {
  readonly competenceId: string;
  readonly libelle: string;
  readonly score: number;
}

export interface EstimationNiveau {
  readonly scoreGlobal: number;
  readonly competences: readonly CompetenceEstimee[];
  readonly confiance: number;
  readonly evaluations: readonly EvaluationDiagnostic[];
}

export interface Lacune {
  readonly sujet: string;
  readonly description: string;
}

/**
 * Le profil d'apprenant est un état vivant : il est enrichi en continu
 * au fil de la progression (diagnostic, exercices, corrections).
 */
export interface ProfilApprenant {
  readonly objectifId: string;
  readonly acquis: readonly string[];
  readonly competences: readonly string[];
  readonly lacunes: readonly Lacune[];
  readonly erreursFrequentes: readonly string[];
  readonly preferencesPedagogiques: readonly string[];
  /** Notions maîtrisées — source unique de la progression. */
  readonly notionsMaitrisees: readonly string[];
  /** Score global interne issu du diagnostic (0–100), null avant finalisation. */
  readonly niveauEstime: number | null;
  readonly miseAJour: string;
}
