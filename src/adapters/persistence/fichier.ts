import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  Objectif,
  ProfilApprenant,
  Roadmap,
  SessionPersistee,
} from "@/core/domain";
import type { Persistance } from "@/core/ports";
import { listerResumesSessions } from "./partage";

interface MagasinPersistance {
  profils: Record<string, ProfilApprenant>;
  roadmaps: Record<string, Roadmap>;
  objectifs: Record<string, Objectif[]>;
  sessions: Record<string, SessionPersistee>;
}

const MAGASIN_VIDE: MagasinPersistance = {
  profils: {},
  roadmaps: {},
  objectifs: {},
  sessions: {},
};

function cheminMagasin(racine: string): string {
  return path.join(racine, ".data", "sessions.json");
}

async function chargerMagasin(racine: string): Promise<MagasinPersistance> {
  const fichier = cheminMagasin(racine);
  try {
    const contenu = await readFile(fichier, "utf8");
    return JSON.parse(contenu) as MagasinPersistance;
  } catch (erreur) {
    if ((erreur as NodeJS.ErrnoException).code === "ENOENT") {
      return structuredClone(MAGASIN_VIDE);
    }
    throw erreur;
  }
}

async function sauvegarderMagasin(
  racine: string,
  magasin: MagasinPersistance,
): Promise<void> {
  const fichier = cheminMagasin(racine);
  await mkdir(path.dirname(fichier), { recursive: true });
  await writeFile(fichier, JSON.stringify(magasin, null, 2), "utf8");
}

function mettreAJourObjectif(magasin: MagasinPersistance, objectif: Objectif): void {
  const liste = magasin.objectifs[objectif.domaineId] ?? [];
  const index = liste.findIndex((o) => o.id === objectif.id);
  if (index >= 0) {
    liste[index] = objectif;
  } else {
    liste.push(objectif);
  }
  magasin.objectifs[objectif.domaineId] = liste;
}

/** Stockage durable sur fichier — pour développement et production locale. */
export function creerPersistanceFichier(
  racine: string = process.cwd(),
): Persistance {
  async function modifierMagasin(
    operation: (magasin: MagasinPersistance) => void,
  ): Promise<void> {
    const magasin = await chargerMagasin(racine);
    operation(magasin);
    await sauvegarderMagasin(racine, magasin);
  }

  return {
    async sauvegarderProfil(profil): Promise<void> {
      await modifierMagasin((magasin) => {
        magasin.profils[profil.objectifId] = profil;
      });
    },
    async chargerProfil(objectifId) {
      const magasin = await chargerMagasin(racine);
      return magasin.profils[objectifId] ?? null;
    },
    async sauvegarderRoadmap(roadmap): Promise<void> {
      await modifierMagasin((magasin) => {
        magasin.roadmaps[roadmap.objectifId] = roadmap;
      });
    },
    async chargerRoadmap(objectifId) {
      const magasin = await chargerMagasin(racine);
      return magasin.roadmaps[objectifId] ?? null;
    },
    async sauvegarderObjectif(objectif): Promise<void> {
      await modifierMagasin((magasin) => {
        mettreAJourObjectif(magasin, objectif);
      });
    },
    async chargerObjectifs(domaineId) {
      const magasin = await chargerMagasin(racine);
      return magasin.objectifs[domaineId] ?? [];
    },
    async sauvegarderSession(session): Promise<void> {
      await modifierMagasin((magasin) => {
        magasin.sessions[session.objectif.id] = session;
        mettreAJourObjectif(magasin, session.objectif);
      });
    },
    async chargerSession(objectifId) {
      const magasin = await chargerMagasin(racine);
      return magasin.sessions[objectifId] ?? null;
    },
    async listerSessions(domaineId) {
      const magasin = await chargerMagasin(racine);
      return listerResumesSessions(Object.values(magasin.sessions), domaineId);
    },
  };
}
