/**
 * Estimation probabiliste de maîtrise d'un nœud (Beta-Bernoulli V0).
 * mean = alpha / (alpha + beta) — dérivé, jamais source de vérité seule.
 */
export interface Croyance {
  readonly noeudId: string;
  readonly alpha: number;
  readonly beta: number;
  readonly derniereMiseAJour: string;
  readonly nObservations: number;
}

/** Estimateur scalaire avec incertitude (mean + variance). */
export interface DistributionScalaire {
  readonly moyenne: number;
  readonly variance: number;
  readonly nObservations: number;
}

export interface FrequenceErreur {
  readonly erreurId: string;
  readonly libelle: string;
  readonly occurrences: number;
  readonly derniereOccurrence: string;
  /** Tendance récente ∈ [-1, 1] (négatif = en baisse). */
  readonly tendance: number;
}

/** Prior non informatif faible (Jeffreys-like adouci). */
export const PRIOR_ALPHA = 1;
export const PRIOR_BETA = 1;

export function croyanceInitiale(
  noeudId: string,
  horodatage: string = new Date().toISOString(),
): Croyance {
  return {
    noeudId,
    alpha: PRIOR_ALPHA,
    beta: PRIOR_BETA,
    derniereMiseAJour: horodatage,
    nObservations: 0,
  };
}

export function moyenneCroyance(croyance: Croyance): number {
  return croyance.alpha / (croyance.alpha + croyance.beta);
}

/** Variance de la Beta — mesure d'incertitude V0. */
export function varianceCroyance(croyance: Croyance): number {
  const a = croyance.alpha;
  const b = croyance.beta;
  const s = a + b;
  return (a * b) / (s * s * (s + 1));
}

export function distributionScalaireInitiale(
  moyenne = 0.5,
  variance = 0.25,
): DistributionScalaire {
  return { moyenne, variance, nObservations: 0 };
}
