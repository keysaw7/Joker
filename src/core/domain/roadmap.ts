/**
 * Une notion est l'unité d'apprentissage : un cycle complet lui est consacré.
 * Elle possède des prérequis, des objectifs pédagogiques et des critères de maîtrise.
 */
export interface CritereDeMaitrise {
  readonly id: string;
  readonly description: string;
}

export interface Notion {
  readonly id: string;
  readonly titre: string;
  readonly prerequisIds: readonly string[];
  readonly objectifsPedagogiques: readonly string[];
  readonly criteresDeMaitrise: readonly CritereDeMaitrise[];
}

/**
 * La roadmap découpe l'objectif en une succession ordonnée de notions.
 * Elle reste évolutive : `version` s'incrémente à chaque adaptation.
 */
export interface Roadmap {
  readonly objectifId: string;
  readonly notions: readonly Notion[];
  readonly version: number;
}
