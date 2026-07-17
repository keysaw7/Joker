import type {
  EtatGrapheCompetences,
  ModeleApprenant,
  Observation,
  PriorsModele,
} from "@/core/domain";

/**
 * Transforme observations + graphe en postérieurs probabilistes.
 * Implémentations interchangeables (Beta V0, BKT, IRT…).
 */
export interface MoteurInference {
  initialiser(eleveId: string, priors?: PriorsModele): ModeleApprenant;

  integrer(
    modele: ModeleApprenant,
    observation: Observation,
    graphe: EtatGrapheCompetences,
  ): ModeleApprenant;

  integrerLot(
    modele: ModeleApprenant,
    observations: readonly Observation[],
    graphe: EtatGrapheCompetences,
  ): ModeleApprenant;
}
