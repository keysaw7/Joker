import type {
  ChampsProfilElevePersistes,
  Objectif,
  ProfilApprenant,
  ResumeSession,
  Roadmap,
  SessionPersistee,
} from "@/core/domain";

/** Stockage de l'état d'apprentissage (profil, roadmap, objectifs, sessions). */
export interface Persistance {
  sauvegarderProfil(profil: ProfilApprenant): Promise<void>;
  chargerProfil(objectifId: string): Promise<ProfilApprenant | null>;
  sauvegarderRoadmap(roadmap: Roadmap): Promise<void>;
  chargerRoadmap(objectifId: string): Promise<Roadmap | null>;
  sauvegarderObjectif(objectif: Objectif): Promise<void>;
  chargerObjectifs(domaineId: string): Promise<readonly Objectif[]>;
  sauvegarderSession(session: SessionPersistee): Promise<void>;
  chargerSession(objectifId: string): Promise<SessionPersistee | null>;
  supprimerSession(objectifId: string): Promise<void>;
  listerSessions(domaineId: string): Promise<readonly ResumeSession[]>;
  chargerToutesSessions(): Promise<readonly SessionPersistee[]>;
  chargerProfilEleve(): Promise<ChampsProfilElevePersistes | null>;
  sauvegarderProfilEleve(champs: ChampsProfilElevePersistes): Promise<void>;
}
