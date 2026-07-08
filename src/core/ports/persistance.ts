import type { Objectif, ProfilApprenant, Roadmap } from "@/core/domain";

/** Stockage de l'état d'apprentissage (profil, roadmap, objectifs). */
export interface Persistance {
  sauvegarderProfil(profil: ProfilApprenant): Promise<void>;
  chargerProfil(objectifId: string): Promise<ProfilApprenant | null>;
  sauvegarderRoadmap(roadmap: Roadmap): Promise<void>;
  chargerRoadmap(objectifId: string): Promise<Roadmap | null>;
  sauvegarderObjectif(objectif: Objectif): Promise<void>;
  chargerObjectifs(domaineId: string): Promise<readonly Objectif[]>;
}
