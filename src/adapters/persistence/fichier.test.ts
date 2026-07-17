import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { creerPersistanceFichier } from "@/adapters/persistence/fichier";
import type { EtatParcours, SessionPersistee } from "@/core/domain";

const contexte = {
  domaine: { id: "maths", nom: "Mathématiques" },
  objectif: {
    id: "obj-1",
    domaineId: "maths",
    intitule: "Comprendre les dérivées",
    creeLe: "2026-01-01T00:00:00.000Z",
  },
  profil: {
    objectifId: "obj-1",
    acquis: [],
    competences: [],
    lacunes: [],
    erreursFrequentes: [],
    preferencesPedagogiques: [],
    notionsMaitrisees: [],
    niveauEstime: null,
    miseAJour: "2026-01-01T00:00:00.000Z",
  },
  roadmap: null,
  notionCouranteId: null,
  reponsesDiagnostic: [],
  estimationNiveau: null,
};

const etatParcours: EtatParcours = {
  contexte,
  phase: "diagnostic",
  questionCourante: {
    id: "q-1",
    intitule: "Quel est ton niveau ?",
    competenceId: "comp-1",
    competenceLibelle: "Niveau",
    difficulte: 3,
  },
  questionsPosees: 0,
  historiqueMaitrise: [],
};

const sessionDiagnostic: SessionPersistee = {
  objectif: contexte.objectif,
  statut: "diagnostic",
  miseAJour: "2026-07-13T10:00:00.000Z",
  etatParcours,
  etatCycle: null,
  archive: null,
};

const sessionJaponais: SessionPersistee = {
  objectif: {
    id: "obj-2",
    domaineId: "japonais",
    intitule: "JLPT N5",
    creeLe: "2026-02-01T00:00:00.000Z",
  },
  statut: "diagnostic",
  miseAJour: "2026-07-12T10:00:00.000Z",
  etatParcours: {
    ...etatParcours,
    contexte: {
      ...contexte,
      domaine: { id: "japonais", nom: "Japonais" },
      objectif: {
        id: "obj-2",
        domaineId: "japonais",
        intitule: "JLPT N5",
        creeLe: "2026-02-01T00:00:00.000Z",
      },
      profil: { ...contexte.profil, objectifId: "obj-2" },
    },
  },
  etatCycle: null,
  archive: null,
};

describe("creerPersistanceFichier", () => {
  let racine: string;

  afterEach(async () => {
    if (racine) {
      await rm(racine, { recursive: true, force: true });
    }
  });

  it("sauvegarde et recharge une session", async () => {
    racine = await mkdtemp(path.join(os.tmpdir(), "joker-persistance-"));
    const persistance = creerPersistanceFichier(racine);

    await persistance.sauvegarderSession(sessionDiagnostic);

    expect(await persistance.chargerSession("obj-1")).toEqual(sessionDiagnostic);
  });

  it("liste les sessions d'un domaine triées par date décroissante", async () => {
    racine = await mkdtemp(path.join(os.tmpdir(), "joker-persistance-"));
    const persistance = creerPersistanceFichier(racine);

    const sessionRecente: SessionPersistee = {
      ...sessionDiagnostic,
      miseAJour: "2026-07-14T10:00:00.000Z",
      objectif: {
        ...sessionDiagnostic.objectif,
        id: "obj-3",
        intitule: "Intégrales",
      },
      etatParcours: {
        ...etatParcours,
        contexte: {
          ...contexte,
          objectif: {
            ...contexte.objectif,
            id: "obj-3",
            intitule: "Intégrales",
          },
          profil: { ...contexte.profil, objectifId: "obj-3" },
        },
      },
    };

    await persistance.sauvegarderSession(sessionJaponais);
    await persistance.sauvegarderSession(sessionDiagnostic);
    await persistance.sauvegarderSession(sessionRecente);

    const sessions = await persistance.listerSessions("maths");

    expect(sessions).toHaveLength(2);
    expect(sessions[0]?.objectif.id).toBe("obj-3");
    expect(sessions[1]?.objectif.id).toBe("obj-1");
    expect(sessions[0]?.statut).toBe("diagnostic");
  });

  it("persiste les données sur disque entre deux instances", async () => {
    racine = await mkdtemp(path.join(os.tmpdir(), "joker-persistance-"));
    const premiere = creerPersistanceFichier(racine);

    await premiere.sauvegarderSession(sessionDiagnostic);
    await premiere.sauvegarderProfil(contexte.profil);
    await premiere.sauvegarderObjectif(contexte.objectif);

    const fichier = path.join(racine, ".data", "sessions.json");
    const contenu = await readFile(fichier, "utf8");
    expect(contenu).toContain("Comprendre les dérivées");

    const seconde = creerPersistanceFichier(racine);

    expect(await seconde.chargerSession("obj-1")).toEqual(sessionDiagnostic);
    expect(await seconde.chargerProfil("obj-1")).toEqual(contexte.profil);
    expect(await seconde.chargerObjectifs("maths")).toHaveLength(1);
  });
});
