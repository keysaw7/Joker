import type {
  ActionPedagogique,
  ContraintesRecommandation,
  EtatGrapheCompetences,
  ModeleApprenant,
} from "@/core/domain";

/**
 * Choisit la prochaine action pédagogique maximisant le gain d'apprentissage.
 */
export interface MoteurRecommandation {
  recommander(
    modele: ModeleApprenant,
    graphe: EtatGrapheCompetences,
    contraintes: ContraintesRecommandation,
  ): ActionPedagogique;
}
