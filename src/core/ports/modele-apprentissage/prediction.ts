import type {
  ActionPedagogique,
  EtatGrapheCompetences,
  ModeleApprenant,
  PredictionTrajectory,
} from "@/core/domain";

/**
 * Prédit l'évolution attendue du modèle selon une action.
 */
export interface MoteurPrediction {
  predire(
    modele: ModeleApprenant,
    action: ActionPedagogique,
    graphe: EtatGrapheCompetences,
    horizon?: number,
  ): PredictionTrajectory;
}
