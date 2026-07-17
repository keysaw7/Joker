import type { ModeleApprenant, Observation } from "@/core/domain";

/**
 * Persistance dédiée du Learning Model (snapshot + log d'observations).
 * Distincte des projections ProfilApprenant / ProfilEleve.
 */
export interface PersistanceModeleApprentissage {
  sauvegarderModele(modele: ModeleApprenant): Promise<void>;
  chargerModele(eleveId: string): Promise<ModeleApprenant | null>;
  ajouterObservation(observation: Observation): Promise<void>;
  listerObservations(
    eleveId: string,
    limite?: number,
  ): Promise<readonly Observation[]>;
}
