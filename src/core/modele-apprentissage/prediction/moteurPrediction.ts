import type { ActionPedagogique, PredictionTrajectory } from "@/core/domain";
import {
  croyanceInitiale,
  moyenneCroyance,
  varianceCroyance,
} from "@/core/domain";
import type { MoteurPrediction } from "@/core/ports";
import { creerMoteurIncertitude } from "../incertitude/moteurIncertitude";

const VARIANCE_MAX = 1 / 12;

/**
 * Prédiction analytique V0 : estime le postérieur attendu si l'action réussit
 * avec P = maîtrise courante (pas de Monte-Carlo).
 */
export function creerMoteurPrediction(): MoteurPrediction {
  const incertitude = creerMoteurIncertitude();

  return {
    predire(modele, action): PredictionTrajectory {
      const noeudId = noeudCible(action);
      const maitriseAttendueParNoeud: Record<string, number> = {};

      for (const [id, croyance] of Object.entries(modele.croyances)) {
        maitriseAttendueParNoeud[id] = moyenneCroyance(croyance);
      }

      let gainAttendu = 0;
      if (noeudId) {
        const croyance =
          modele.croyances[noeudId] ?? croyanceInitiale(noeudId);
        const pSucces = moyenneCroyance(croyance);
        // Postérieur attendu si succès (alpha+1) ou échec (beta+1)
        const meanSucces =
          (croyance.alpha + 1) / (croyance.alpha + croyance.beta + 1);
        const meanEchec =
          croyance.alpha / (croyance.alpha + croyance.beta + 1);
        const meanAttendu = pSucces * meanSucces + (1 - pSucces) * meanEchec;
        maitriseAttendueParNoeud[noeudId] = meanAttendu;
        gainAttendu = meanAttendu - moyenneCroyance(croyance);
      }

      const variances = Object.entries(maitriseAttendueParNoeud).map(
        ([id, mean]) => {
          const c = modele.croyances[id];
          if (!c) return (mean * (1 - mean)) / 4;
          // Approximation : variance baisse légèrement avec une obs
          return varianceCroyance(c) * 0.85;
        },
      );
      const incertitudeAttendueGlobale =
        variances.length === 0
          ? incertitude.incertitudeGlobale(modele)
          : variances.reduce((a, b) => a + b, 0) /
            variances.length /
            VARIANCE_MAX;

      return {
        action,
        maitriseAttendueParNoeud,
        incertitudeAttendueGlobale,
        gainAttendu,
      };
    },
  };
}

function noeudCible(action: ActionPedagogique): string | null {
  switch (action.type) {
    case "sonder_competence":
    case "reviser":
      return action.noeudId;
    case "enseigner_notion":
    case "exercer":
      return action.notionId;
    case "remedier":
      return action.erreurId;
  }
}
