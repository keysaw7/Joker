/**
 * Un domaine est un champ de connaissance (actuellement le japonais ; le moteur reste extensible).
 * Le moteur reste identique quel que soit le domaine : seul le contenu change.
 */
export interface Domaine {
  readonly id: string;
  readonly nom: string;
  readonly description?: string;
}
