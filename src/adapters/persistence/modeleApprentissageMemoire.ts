import type { ModeleApprenant, Observation } from "@/core/domain";
import type { PersistanceModeleApprentissage } from "@/core/ports";

/** Persistance en mémoire du Learning Model — tests et dev. */
export function creerPersistanceModeleMemoire(): PersistanceModeleApprentissage {
  const modeles = new Map<string, ModeleApprenant>();
  const observations = new Map<string, Observation[]>();

  return {
    async sauvegarderModele(modele) {
      modeles.set(modele.eleveId, modele);
    },

    async chargerModele(eleveId) {
      return modeles.get(eleveId) ?? null;
    },

    async ajouterObservation(observation) {
      const liste = observations.get(observation.eleveId) ?? [];
      liste.push(observation);
      observations.set(observation.eleveId, liste);
    },

    async listerObservations(eleveId, limite = 1000) {
      const liste = observations.get(eleveId) ?? [];
      return liste.slice(-limite);
    },
  };
}
