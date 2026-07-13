import type { Objectif, ProfilApprenant, Roadmap, SessionPersistee } from "@/core/domain";
import type { Persistance } from "@/core/ports";
import { listerResumesSessions } from "./partage";

/** Stockage en mémoire — pour tests et développement local. */
export function creerPersistanceMemoire(): Persistance {
  const profils = new Map<string, ProfilApprenant>();
  const roadmaps = new Map<string, Roadmap>();
  const objectifs = new Map<string, Objectif[]>();
  const sessions = new Map<string, SessionPersistee>();

  return {
    async sauvegarderProfil(profil): Promise<void> {
      profils.set(profil.objectifId, profil);
    },
    async chargerProfil(objectifId): Promise<ProfilApprenant | null> {
      return profils.get(objectifId) ?? null;
    },
    async sauvegarderRoadmap(roadmap): Promise<void> {
      roadmaps.set(roadmap.objectifId, roadmap);
    },
    async chargerRoadmap(objectifId): Promise<Roadmap | null> {
      return roadmaps.get(objectifId) ?? null;
    },
    async sauvegarderObjectif(objectif): Promise<void> {
      const liste = objectifs.get(objectif.domaineId) ?? [];
      const index = liste.findIndex((o) => o.id === objectif.id);
      if (index >= 0) {
        liste[index] = objectif;
      } else {
        liste.push(objectif);
      }
      objectifs.set(objectif.domaineId, liste);
    },
    async chargerObjectifs(domaineId): Promise<readonly Objectif[]> {
      return objectifs.get(domaineId) ?? [];
    },
    async sauvegarderSession(session): Promise<void> {
      sessions.set(session.objectif.id, session);
      const liste = objectifs.get(session.objectif.domaineId) ?? [];
      const index = liste.findIndex((o) => o.id === session.objectif.id);
      if (index >= 0) {
        liste[index] = session.objectif;
      } else {
        liste.push(session.objectif);
      }
      objectifs.set(session.objectif.domaineId, liste);
    },
    async chargerSession(objectifId): Promise<SessionPersistee | null> {
      return sessions.get(objectifId) ?? null;
    },
    async listerSessions(domaineId) {
      return listerResumesSessions([...sessions.values()], domaineId);
    },
  };
}
