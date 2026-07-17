import type {
  Croyance,
  DistributionScalaire,
  FrequenceErreur,
} from "./croyance";
import { distributionScalaireInitiale } from "./croyance";

/**
 * Source de vérité du Learning Model.
 * Pas d'étiquettes fixes, pas de notes, pas de niveaux discrets —
 * uniquement distributions, historiques et confiances.
 */
export interface ParametresAcquisition {
  readonly vitesseAcquisition: DistributionScalaire;
  readonly vitesseOubli: DistributionScalaire;
  readonly sensibiliteDifficulte: DistributionScalaire;
}

export interface PreferencesObservees {
  /** P(succès | format) observé — pas de type mémoire catégorique. */
  readonly efficaciteParFormat: Readonly<Record<string, Croyance>>;
  readonly rythmeOptimal: DistributionScalaire;
}

export interface ModeleApprenant {
  readonly eleveId: string;
  readonly version: number;
  readonly croyances: Readonly<Record<string, Croyance>>;
  readonly parametresAcquisition: ParametresAcquisition;
  readonly preferences: PreferencesObservees;
  readonly erreurs: Readonly<Record<string, FrequenceErreur>>;
  readonly historiqueObservationIds: readonly string[];
  readonly miseAJour: string;
}

export interface PriorsModele {
  readonly parametresAcquisition?: Partial<ParametresAcquisition>;
  readonly preferences?: Partial<PreferencesObservees>;
}

export function modeleApprenantInitial(
  eleveId: string,
  priors?: PriorsModele,
): ModeleApprenant {
  const maintenant = new Date().toISOString();
  return {
    eleveId,
    version: 0,
    croyances: {},
    parametresAcquisition: {
      vitesseAcquisition:
        priors?.parametresAcquisition?.vitesseAcquisition ??
        distributionScalaireInitiale(0.5, 0.2),
      vitesseOubli:
        priors?.parametresAcquisition?.vitesseOubli ??
        distributionScalaireInitiale(0.1, 0.05),
      sensibiliteDifficulte:
        priors?.parametresAcquisition?.sensibiliteDifficulte ??
        distributionScalaireInitiale(0.5, 0.2),
    },
    preferences: {
      efficaciteParFormat: priors?.preferences?.efficaciteParFormat ?? {},
      rythmeOptimal:
        priors?.preferences?.rythmeOptimal ??
        distributionScalaireInitiale(5, 4),
    },
    erreurs: {},
    historiqueObservationIds: [],
    miseAJour: maintenant,
  };
}
