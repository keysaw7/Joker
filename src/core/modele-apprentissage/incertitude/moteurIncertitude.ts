import type {
  ActionPedagogique,
  Croyance,
  ModeleApprenant,
} from "@/core/domain";
import { croyanceInitiale, varianceCroyance } from "@/core/domain";
import type { MoteurIncertitude } from "@/core/ports";

/** Variance max théorique pour Beta(1,1) ≈ 1/12. */
const VARIANCE_MAX = 1 / 12;

export function creerMoteurIncertitude(): MoteurIncertitude {
  return {
    incertitudeNoeud(croyance: Croyance) {
      return varianceCroyance(croyance) / VARIANCE_MAX;
    },

    incertitudeGlobale(modele: ModeleApprenant) {
      const croyances = Object.values(modele.croyances);
      if (croyances.length === 0) {
        return 1;
      }
      const somme = croyances.reduce(
        (acc, c) => acc + varianceCroyance(c) / VARIANCE_MAX,
        0,
      );
      return somme / croyances.length;
    },

    zonesIncertaines(modele, graphe, k) {
      const candidats =
        graphe.noeuds.length > 0
          ? graphe.noeuds.map((n) => n.id)
          : Object.keys(modele.croyances);

      const scores = candidats.map((id) => {
        const croyance = modele.croyances[id] ?? croyanceInitiale(id);
        return {
          id,
          score: varianceCroyance(croyance) / VARIANCE_MAX,
        };
      });

      return scores
        .sort((a, b) => b.score - a.score)
        .slice(0, Math.max(0, k))
        .map((s) => s.id);
    },

    valeurInformation(action: ActionPedagogique, modele: ModeleApprenant) {
      const noeudId = noeudCible(action);
      if (!noeudId) {
        return 0.1;
      }
      const croyance = modele.croyances[noeudId] ?? croyanceInitiale(noeudId);
      return varianceCroyance(croyance) / VARIANCE_MAX;
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
