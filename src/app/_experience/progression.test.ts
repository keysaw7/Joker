import { describe, expect, it } from "vitest";
import type { EtatCycle } from "@/core/domain";
import {
  indexNotionCourante,
  libelleEtape,
  notionsMaitriseesValides,
  progression,
} from "./progression";

function etatCycle(overrides: Partial<EtatCycle> = {}): EtatCycle {
  return {
    contexte: {
      domaine: { id: "maths", nom: "Mathématiques" },
      objectif: {
        id: "obj-1",
        domaineId: "maths",
        intitule: "Test",
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
      niveauEstime: null,
        miseAJour: "2026-01-01",
      },
      roadmap: {
        objectifId: "obj-1",
        version: 1,
        notions: [
          { id: "n1", titre: "A", prerequisIds: [], objectifsPedagogiques: [], criteresDeMaitrise: [] },
          { id: "n2", titre: "B", prerequisIds: [], objectifsPedagogiques: [], criteresDeMaitrise: [] },
        ],
      },
      notionCouranteId: "n1",
      reponsesDiagnostic: [],
      estimationNiveau: null,
    },
    etape: "problematique",
    contenu: {
      type: "problematique",
      problematique: {
        notionId: "n1",
        intitule: "Pourquoi ?",
        forme: "question",
        casDusage: [],
      },
    },
    etatExercices: null,
    termine: false,
    ...overrides,
  };
}

describe("progression — logique pure de presentation", () => {
  it("au démarrage : notion courante 1/2 et 0 maîtrisée", () => {
    expect(progression(etatCycle())).toEqual({
      total: 2,
      faites: 0,
      courante: 1,
      pourcentage: 0,
    });
  });

  it("calcule la progression depuis la roadmap et le profil", () => {
    const etat = etatCycle({
      contexte: {
        ...etatCycle().contexte,
        notionCouranteId: "n2",
        profil: {
          ...etatCycle().contexte.profil,
          notionsMaitrisees: ["n1"],
        },
      },
    });
    expect(progression(etat)).toEqual({
      total: 2,
      faites: 1,
      courante: 2,
      pourcentage: 50,
    });
  });

  it("ignore les notionsMaitrisees qui ne sont pas des IDs de roadmap", () => {
    const etat = etatCycle({
      contexte: {
        ...etatCycle().contexte,
        profil: {
          ...etatCycle().contexte.profil,
          notionsMaitrisees: ["bases de la pâte", "savoir pétrir", "n1"],
        },
      },
    });
    expect(progression(etat).faites).toBe(1);
    expect(
      notionsMaitriseesValides(
        ["bases de la pâte", "n1"],
        etat.contexte.roadmap,
      ),
    ).toEqual(["n1"]);
  });

  it("indexNotionCourante est 1-based", () => {
    const roadmap = etatCycle().contexte.roadmap!;
    expect(indexNotionCourante(roadmap, "n1")).toBe(1);
    expect(indexNotionCourante(roadmap, "n2")).toBe(2);
    expect(indexNotionCourante(roadmap, null)).toBe(0);
  });

  it("libelleEtape retourne des libelles FR lisibles", () => {
    expect(libelleEtape("cours")).toBe("Cours");
    expect(libelleEtape("exercices")).toBe("Exercices");
    expect(libelleEtape("recompense")).toBe("Récompense");
  });
});
