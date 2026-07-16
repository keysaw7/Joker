/**
 * Le moteur choisit automatiquement les meilleurs supports pédagogiques.
 * Le contenu peut prendre toutes les formes utiles ; l'élève ne perçoit
 * qu'un seul cours cohérent.
 */

export type GenreGraphique = "barres" | "lignes" | "aire" | "secteurs";

export interface PointGraphique {
  readonly etiquette: string;
  readonly valeur: number;
}

export interface SerieGraphique {
  readonly nom: string;
  readonly points: readonly PointGraphique[];
}

export interface SpecGraphique {
  readonly genre: GenreGraphique;
  readonly titre?: string;
  readonly axeX?: string;
  readonly series: readonly SerieGraphique[];
}

export interface AssetImage {
  readonly id: string;
  readonly url: string;
  readonly mediaType: string;
}

export interface EtapeCours {
  readonly titre: string;
  readonly markdown: string;
}

export type VarianteEncadre = "info" | "attention" | "astuce" | "exemple";

export type BlocContenu =
  | { readonly type: "texte"; readonly markdown: string }
  | {
      readonly type: "encadre";
      readonly variante: VarianteEncadre;
      readonly markdown: string;
      readonly titre?: string;
    }
  | {
      readonly type: "analogie";
      readonly source: string;
      readonly cible: string;
      readonly explication: string;
    }
  | {
      readonly type: "comparaison";
      readonly entetes: readonly string[];
      readonly lignes: readonly (readonly string[])[];
    }
  | {
      readonly type: "tableau";
      readonly entetes: readonly string[];
      readonly lignes: readonly (readonly string[])[];
      readonly legende?: string;
    }
  | { readonly type: "schema"; readonly mermaid: string; readonly legende?: string }
  | {
      readonly type: "graphique";
      readonly graphique: SpecGraphique;
      readonly legende?: string;
    }
  | {
      readonly type: "image";
      readonly assetId: string;
      readonly url: string;
      readonly alt: string;
      readonly briefGeneration: string;
      readonly legende?: string;
    }
  | { readonly type: "etapes"; readonly etapes: readonly EtapeCours[] }
  | {
      readonly type: "quizFlash";
      readonly question: string;
      readonly options: readonly string[];
      readonly bonneReponse: number;
      readonly explication: string;
    };

/** Cas d'usage concret débloqué en progressant vers l'objectif de l'élève. */
export interface CasDusage {
  readonly titre: string;
  readonly description: string;
}

/**
 * La problématique crée une tension cognitive AVANT toute explication :
 * elle donne une raison d'apprendre.
 */
export interface Problematique {
  readonly notionId: string;
  readonly intitule: string;
  readonly forme: "question" | "probleme" | "defi" | "situation" | "objectif";
  readonly casDusage: readonly CasDusage[];
}

/** Le cours : cœur du produit. Doit rester clair, lisible, épuré. */
export interface Cours {
  readonly notionId: string;
  readonly titre: string;
  readonly blocs: readonly BlocContenu[];
}

/** Types de blocs autorisés dans la démonstration d'un exemple d'expert. */
export const TYPES_BLOC_EXEMPLE_EXPERT = [
  "texte",
  "encadre",
  "analogie",
  "image",
] as const;

export type TypeBlocExempleExpert = (typeof TYPES_BLOC_EXEMPLE_EXPERT)[number];

/**
 * Montre comment un expert utilise la notion en situation réelle.
 * La démonstration est narrative et concrète — pas un mini-cours :
 * pas de quiz, procédures pas-à-pas, schémas ni graphiques didactiques.
 */
export interface ExempleExpert {
  readonly notionId: string;
  readonly contexte: string;
  readonly demonstration: readonly BlocContenu[];
}

/** @deprecated Utiliser BlocContenu avec union discriminée par `type`. */
export type FormatContenu =
  | "texte"
  | "image"
  | "schema"
  | "diagramme"
  | "graphique"
  | "tableau"
  | "video"
  | "animation"
  | "simulation"
  | "comparaison"
  | "analogie";

export type TypeBlocCours = BlocContenu["type"];

export type TypeIntentionBloc = BlocContenu["type"];

export type IntentionBloc =
  | { readonly type: "texte"; readonly markdown: string }
  | {
      readonly type: "encadre";
      readonly variante: VarianteEncadre;
      readonly markdown: string;
      readonly titre?: string;
    }
  | {
      readonly type: "analogie";
      readonly source: string;
      readonly cible: string;
      readonly explication: string;
    }
  | {
      readonly type: "comparaison";
      readonly entetes: readonly string[];
      readonly lignes: readonly (readonly string[])[];
    }
  | {
      readonly type: "tableau";
      readonly entetes: readonly string[];
      readonly lignes: readonly (readonly string[])[];
      readonly legende?: string;
    }
  | { readonly type: "schema"; readonly briefMedia: string; readonly legende?: string }
  | { readonly type: "graphique"; readonly briefMedia: string; readonly legende?: string }
  | {
      readonly type: "image";
      readonly briefMedia: string;
      readonly alt: string;
      readonly legende?: string;
    }
  | { readonly type: "etapes"; readonly etapes: readonly EtapeCours[] }
  | {
      readonly type: "quizFlash";
      readonly question: string;
      readonly options: readonly string[];
      readonly bonneReponse: number;
      readonly explication: string;
    };

export interface PlanCours {
  readonly titre: string;
  readonly intentions: readonly IntentionBloc[];
}
