import type {
  ActionPedagogique,
  Croyance,
  EtatGrapheCompetences,
  ModeleApprenant,
} from "@/core/domain";

/**
 * Quantifie l'ignorance utile — où observer ensuite.
 */
export interface MoteurIncertitude {
  incertitudeNoeud(croyance: Croyance): number;

  incertitudeGlobale(modele: ModeleApprenant): number;

  zonesIncertaines(
    modele: ModeleApprenant,
    graphe: EtatGrapheCompetences,
    k: number,
  ): readonly string[];

  valeurInformation(
    action: ActionPedagogique,
    modele: ModeleApprenant,
  ): number;
}
