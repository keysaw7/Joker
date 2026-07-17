import type {
  ActionPedagogique,
  ContraintesRecommandation,
  EtatGrapheCompetences,
  ModeleApprenant,
  NiveauGuidage,
} from "@/core/domain";
import { croyanceInitiale, moyenneCroyance, varianceCroyance } from "@/core/domain";
import type { MoteurIncertitude, MoteurRecommandation } from "@/core/ports";
import { creerMoteurIncertitude } from "../incertitude/moteurIncertitude";
import { SEUIL_MAITRISE_MOYENNE } from "../projections/projeterProfil";

const VARIANCE_MAX = 1 / 12;

export function creerMoteurRecommandation(
  incertitude: MoteurIncertitude = creerMoteurIncertitude(),
): MoteurRecommandation {
  return {
    recommander(modele, graphe, contraintes) {
      if (contraintes.phase === "diagnostic") {
        return recommanderDiagnostic(modele, graphe, incertitude);
      }
      return recommanderCycle(modele, graphe, contraintes, incertitude);
    },
  };
}

function recommanderDiagnostic(
  modele: ModeleApprenant,
  graphe: EtatGrapheCompetences,
  incertitude: MoteurIncertitude,
): ActionPedagogique {
  const zones = incertitude.zonesIncertaines(modele, graphe, 5);
  const noeudId =
    zones[0] ??
    graphe.noeuds[0]?.id ??
    Object.keys(modele.croyances)[0] ??
    "competence-generale";

  const croyance = modele.croyances[noeudId] ?? croyanceInitiale(noeudId);
  const mean = moyenneCroyance(croyance);
  // Difficulté 1–5 selon maîtrise estimée
  const difficulte = Math.max(1, Math.min(5, Math.round(1 + mean * 4)));

  return { type: "sonder_competence", noeudId, difficulte };
}

function recommanderCycle(
  modele: ModeleApprenant,
  graphe: EtatGrapheCompetences,
  contraintes: ContraintesRecommandation,
  incertitude: MoteurIncertitude,
): ActionPedagogique {
  const maitrisees = new Set(contraintes.notionsMaitrisees ?? []);
  const eligibles =
    contraintes.notionsEligibles ??
    graphe.noeuds.filter((n) => n.type === "notion").map((n) => n.id);

  const erreursFrequentes = Object.values(modele.erreurs).sort(
    (a, b) => b.occurrences - a.occurrences,
  );
  if (erreursFrequentes[0] && erreursFrequentes[0].occurrences >= 2) {
    return { type: "remedier", erreurId: erreursFrequentes[0].erreurId };
  }

  let meilleure: ActionPedagogique | null = null;
  let meilleurScore = -Infinity;

  for (const notionId of eligibles) {
    if (maitrisees.has(notionId)) {
      const croyance = modele.croyances[notionId];
      if (croyance && varianceCroyance(croyance) / VARIANCE_MAX > 0.4) {
        const action: ActionPedagogique = { type: "reviser", noeudId: notionId };
        const score =
          incertitude.valeurInformation(action, modele) * 0.8 -
          0.1;
        if (score > meilleurScore) {
          meilleurScore = score;
          meilleure = action;
        }
      }
      continue;
    }

    const croyance = modele.croyances[notionId] ?? croyanceInitiale(notionId);
    const mean = moyenneCroyance(croyance);
    const guidage = guidageDepuisCroyance(mean);
    const action: ActionPedagogique = {
      type: "exercer",
      notionId,
      guidage,
    };
    const deltaMaitrise = 1 - mean;
    const voi = incertitude.valeurInformation(action, modele);
    const score = deltaMaitrise * 1.2 + voi - 0.05;
    if (score > meilleurScore) {
      meilleurScore = score;
      meilleure = action;
    }
  }

  if (meilleure) {
    return meilleure;
  }

  const premiereNotion =
    eligibles.find((id) => !maitrisees.has(id)) ?? eligibles[0];
  if (premiereNotion) {
    return {
      type: "enseigner_notion",
      notionId: premiereNotion,
    };
  }

  return {
    type: "sonder_competence",
    noeudId: "competence-generale",
    difficulte: 3,
  };
}

export function guidageDepuisCroyance(maitriseMoyenne: number): NiveauGuidage {
  if (maitriseMoyenne >= SEUIL_MAITRISE_MOYENNE) {
    return "autonome";
  }
  if (maitriseMoyenne >= 0.4) {
    return "modere";
  }
  return "fort";
}

/** Guidage initial dérivé du modèle (remplace les seuils score 70/40). */
export function guidageInitialDepuisModele(
  modele: ModeleApprenant | null,
  scoreFallback = 0,
): NiveauGuidage {
  if (!modele || Object.keys(modele.croyances).length === 0) {
    if (scoreFallback >= 70) return "autonome";
    if (scoreFallback >= 40) return "modere";
    return "fort";
  }
  const croyances = Object.values(modele.croyances).filter(
    (c) => c.nObservations > 0,
  );
  if (croyances.length === 0) {
    return "fort";
  }
  const mean =
    croyances.reduce((acc, c) => acc + moyenneCroyance(c), 0) /
    croyances.length;
  return guidageDepuisCroyance(mean);
}
