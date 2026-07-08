/**
 * Le moteur choisit automatiquement les meilleurs supports pédagogiques.
 * Le contenu peut prendre toutes les formes utiles ; l'élève ne perçoit
 * qu'un seul cours cohérent.
 */
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

export interface BlocContenu {
  readonly format: FormatContenu;
  /** Texte, ou description/URL du média selon le format. */
  readonly contenu: string;
  readonly legende?: string;
}

/**
 * La problématique crée une tension cognitive AVANT toute explication :
 * elle donne une raison d'apprendre.
 */
export interface Problematique {
  readonly notionId: string;
  readonly intitule: string;
  readonly forme: "question" | "probleme" | "defi" | "situation" | "objectif";
}

/** Le cours : cœur du produit. Doit rester clair, lisible, épuré. */
export interface Cours {
  readonly notionId: string;
  readonly titre: string;
  readonly blocs: readonly BlocContenu[];
}

/** Montre la connaissance en contexte : comment un expert l'utilise réellement. */
export interface ExempleExpert {
  readonly notionId: string;
  readonly contexte: string;
  readonly demonstration: readonly BlocContenu[];
}
