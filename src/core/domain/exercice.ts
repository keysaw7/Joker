/**
 * Les exercices sont adaptatifs : la progression va du fort guidage vers l'autonomie.
 * L'objectif n'est pas de terminer une série, mais de supprimer les erreurs de compréhension.
 */
export type NiveauGuidage = "fort" | "modere" | "autonome";

export interface Exercice {
  readonly id: string;
  readonly notionId: string;
  readonly enonce: string;
  readonly guidage: NiveauGuidage;
  /** Renseigné lorsque l'exercice cible précisément une difficulté (remédiation). */
  readonly cibleLacune?: string;
}

export interface ReponseApprenant {
  readonly exerciceId: string;
  readonly contenu: string;
}

/**
 * Après chaque réponse, le moteur analyse : correct ou non, pourquoi,
 * quelle connaissance manque, quelle confusion, quelle erreur cognitive.
 */
export interface AnalyseReponse {
  readonly correcte: boolean;
  readonly pourquoi: string;
  readonly connaissanceManquante?: string;
  readonly confusion?: string;
  readonly erreurCognitive?: string;
}

export interface Correction {
  readonly exerciceId: string;
  readonly analyse: AnalyseReponse;
  readonly explicationPersonnalisee: string;
}
