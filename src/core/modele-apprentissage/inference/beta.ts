import type { Croyance, MaitriseDiagnostic } from "@/core/domain";
import { croyanceInitiale } from "@/core/domain";

/** Poids de succès pour une maîtrise diagnostic. */
export function succesDepuisMaitrise(maitrise: MaitriseDiagnostic): number {
  if (maitrise === "maitrise") return 1;
  if (maitrise === "partiel") return 0.55;
  return 0;
}

/**
 * Met à jour une croyance Beta avec une observation de succès partiel ∈ [0, 1].
 * succes=1 → alpha+=1 ; succes=0 → beta+=1 ; valeurs intermédiaires fractionnaires.
 */
export function mettreAJourCroyanceBeta(
  croyance: Croyance | undefined,
  noeudId: string,
  succes: number,
  horodatage: string,
  force = 1,
): Croyance {
  const base = croyance ?? croyanceInitiale(noeudId, horodatage);
  const s = Math.max(0, Math.min(1, succes));
  const f = Math.max(0, force);
  return {
    noeudId,
    alpha: base.alpha + s * f,
    beta: base.beta + (1 - s) * f,
    derniereMiseAJour: horodatage,
    nObservations: base.nObservations + 1,
  };
}

/** Amortissement pour propagation aux prérequis / dépendants. */
export const FACTEUR_PROPAGATION = 0.35;
