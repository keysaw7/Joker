import { describe, expect, it } from "vitest";
import type { EtatCycle } from "@/core/domain";
import { fusionnerArchive, contenuArchive } from "@/app/_serveur/archive";
import { cheminSessionCourant, estEtapeCourante } from "@/app/_experience/navigation";

function etatCycle(overrides: Partial<EtatCycle> = {}): EtatCycle {
  return {
    contexte: {
      domaine: { id: "cuisine", nom: "Cuisine" },
      objectif: {
        id: "obj-1",
        domaineId: "cuisine",
        intitule: "Pizza",
        creeLe: "2026-01-01",
      },
      profil: {
        objectifId: "obj-1",
        acquis: [],
        competences: [],
        lacunes: [],
        erreursFrequentes: [],
        preferencesPedagogiques: [],
        notionsMaitrisees: [],
        miseAJour: "2026-01-01",
      },
      roadmap: {
        objectifId: "obj-1",
        version: 1,
        notions: [
          {
            id: "n1",
            titre: "Pâte",
            prerequisIds: [],
            objectifsPedagogiques: [],
            criteresDeMaitrise: [],
          },
        ],
      },
      notionCouranteId: "n1",
      reponsesDiagnostic: [],
    },
    etape: "problematique",
    contenu: {
      type: "problematique",
      problematique: {
        notionId: "n1",
        intitule: "Pourquoi la pâte ?",
        forme: "question",
        casDusage: [],
      },
    },
    etatExercices: null,
    termine: false,
    ...overrides,
  };
}

describe("fusionnerArchive", () => {
  it("archive le contenu de l'étape courante", () => {
    const etat = etatCycle();
    const archive = fusionnerArchive(null, etat);

    expect(archive.notions).toHaveLength(1);
    expect(archive.notions[0]?.notionId).toBe("n1");
    expect(archive.notions[0]?.etapes[0]?.etape).toBe("problematique");
    expect(contenuArchive(archive, "n1", "problematique")?.type).toBe("problematique");
  });

  it("empile les échanges d'exercice", () => {
    const etat = etatCycle({
      etape: "exercices",
      contenu: {
        type: "exercice",
        exercice: {
          id: "ex-1",
          notionId: "n1",
          enonce: "Question ?",
          guidage: "fort",
        },
        correctionPrecedente: {
          exerciceId: "ex-1",
          analyse: { correcte: false, pourquoi: "Incomplet" },
          explicationPersonnalisee: "Presque",
        },
      },
      etatExercices: {
        exerciceCourant: {
          id: "ex-1",
          notionId: "n1",
          enonce: "Question ?",
          guidage: "fort",
        },
        guidageActuel: "fort",
        lacuneActive: null,
      },
    });

    const archive = fusionnerArchive(null, etat, {
      enonce: "Question ?",
      reponse: "Ma réponse",
    });

    expect(archive.notions[0]?.echangesExercice).toHaveLength(1);
    expect(archive.notions[0]?.echangesExercice[0]?.reponse).toBe("Ma réponse");
  });
});

describe("navigation session", () => {
  it("redirige vers la bonne étape du cycle", () => {
    const etat = etatCycle({ etape: "cours" });
    const chemin = cheminSessionCourant({
      objectif: etat.contexte.objectif,
      statut: "cycle",
      miseAJour: "2026-01-01",
      etatParcours: null,
      etatCycle: etat,
      archive: null,
    });

    expect(chemin).toBe("/session/obj-1/notion/n1/cours");
  });

  it("détecte l'étape courante", () => {
    const session = {
      objectif: etatCycle().contexte.objectif,
      statut: "cycle" as const,
      miseAJour: "2026-01-01",
      etatParcours: null,
      etatCycle: etatCycle(),
      archive: null,
    };

    expect(estEtapeCourante(session, "n1", "problematique")).toBe(true);
    expect(estEtapeCourante(session, "n1", "cours")).toBe(false);
  });
});
