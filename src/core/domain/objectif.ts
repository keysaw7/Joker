/**
 * L'objectif est le but concret que l'élève poursuit (ex. « Réussir le JLPT N5 »).
 * Une fois créé, il devient le contexte principal de toute la progression.
 */
export interface Objectif {
  readonly id: string;
  readonly domaineId: string;
  readonly intitule: string;
  readonly description?: string;
  readonly creeLe: string;
}
