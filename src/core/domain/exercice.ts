/**
 * Les exercices sont adaptatifs : la progression va du fort guidage vers l'autonomie.
 * L'objectif n'est pas de terminer une série, mais de supprimer les erreurs de compréhension.
 */
export type NiveauGuidage = "fort" | "modere" | "autonome";

export type FormatExercice =
  | "qcm"
  | "trous"
  | "appariement"
  | "production_libre";

export const FORMATS_EXERCICE_FERMES = [
  "qcm",
  "trous",
  "appariement",
] as const satisfies readonly FormatExercice[];

export function formatExerciceEstFerme(
  format: FormatExercice,
): format is (typeof FORMATS_EXERCICE_FERMES)[number] {
  return (FORMATS_EXERCICE_FERMES as readonly string[]).includes(format);
}

export interface PhraseATrous {
  readonly id: string;
  /** Texte contenant un marqueur `___` pour le trou. */
  readonly texteAvecTrous: string;
  /** Réponses acceptées pour le trou (synonymes inclus). */
  readonly solutions: readonly string[];
}

export interface PaireAppariement {
  readonly id: string;
  readonly gauche: string;
  readonly droite: string;
}

interface ExerciceBase {
  readonly id: string;
  readonly notionId: string;
  readonly guidage: NiveauGuidage;
  /** Consigne courte affichée au-dessus du contenu interactif. */
  readonly consigne: string;
  /** Renseigné lorsque l'exercice cible précisément une difficulté (remédiation). */
  readonly cibleLacune?: string;
}

export type Exercice =
  | (ExerciceBase & {
      readonly format: "qcm";
      readonly question: string;
      readonly options: readonly string[];
      readonly bonneReponse: number;
    })
  | (ExerciceBase & {
      readonly format: "trous";
      readonly phrases: readonly PhraseATrous[];
    })
  | (ExerciceBase & {
      readonly format: "appariement";
      readonly paires: readonly PaireAppariement[];
      readonly distracteurs?: readonly string[];
    })
  | (ExerciceBase & {
      readonly format: "production_libre";
      readonly enonce: string;
      readonly criteres?: readonly string[];
      readonly aide?: string;
    });

export type ReponseApprenant =
  | {
      readonly exerciceId: string;
      readonly format: "qcm";
      readonly indexChoisi: number;
    }
  | {
      readonly exerciceId: string;
      readonly format: "trous";
      /** Clé = id de phrase, valeur = réponses saisies (un trou par phrase en V1). */
      readonly remplissages: Readonly<Record<string, readonly string[]>>;
    }
  | {
      readonly exerciceId: string;
      readonly format: "appariement";
      /** Clé = id de paire, valeur = élément droit associé. */
      readonly associations: Readonly<Record<string, string>>;
    }
  | {
      readonly exerciceId: string;
      readonly format: "production_libre";
      readonly contenu: string;
    };

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

export interface FeedbackItem {
  readonly id: string;
  readonly correct: boolean;
  readonly attendu?: string;
  readonly obtenu?: string;
  readonly commentaire?: string;
}

export interface Correction {
  readonly exerciceId: string;
  readonly analyse: AnalyseReponse;
  readonly resume: string;
  readonly items: readonly FeedbackItem[];
  readonly pointsForts?: readonly string[];
  readonly aRetravailler?: readonly string[];
}

/** Texte d'affichage / archive pour un exercice. */
export function resumeTexteExercice(exercice: Exercice): string {
  switch (exercice.format) {
    case "qcm":
      return `${exercice.consigne}\n${exercice.question}`;
    case "trous":
      return `${exercice.consigne}\n${exercice.phrases.map((p) => p.texteAvecTrous).join("\n")}`;
    case "appariement":
      return `${exercice.consigne}\nApparier ${exercice.paires.length} paires`;
    case "production_libre":
      return `${exercice.consigne}\n${exercice.enonce}`;
  }
}

/** Texte d'affichage / archive pour une réponse. */
export function resumeTexteReponse(reponse: ReponseApprenant): string {
  switch (reponse.format) {
    case "qcm":
      return `Option ${reponse.indexChoisi + 1}`;
    case "trous":
      return Object.entries(reponse.remplissages)
        .map(([id, vals]) => `${id}: ${vals.join(", ")}`)
        .join(" · ");
    case "appariement":
      return Object.entries(reponse.associations)
        .map(([id, droite]) => `${id} → ${droite}`)
        .join(" · ");
    case "production_libre":
      return reponse.contenu;
  }
}
