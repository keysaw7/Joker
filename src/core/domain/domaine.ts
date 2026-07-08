/**
 * Un domaine est un champ de connaissance (mathématiques, japonais, cuisine…).
 * Le moteur reste identique quel que soit le domaine : seul le contenu change.
 */
export interface Domaine {
  readonly id: string;
  readonly nom: string;
  readonly description?: string;
}
