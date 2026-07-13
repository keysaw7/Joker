import { describe, expect, it } from "vitest";
import type { EtatCycle } from "@/core/domain";
import { libelleEtape, progression } from "./progression";

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
    },
    etape: "problematique",
    contenu: {
      type: "problematique",
      problematique: { notionId: "n1", intitule: "Pourquoi ?", forme: "question" },
    },
    etatExercices: null,
    termine: false,
    ...overrides,
  };
}

describe("progression — logique pure de presentation", () => {
  it("calcule la progression depuis la roadmap et le profil", () => {
    const etat = etatCycle({
      contexte: {
        ...etatCycle().contexte,
        profil: {
          ...etatCycle().contexte.profil,
          notionsMaitrisees: ["n1"],
        },
      },
    });
    expect(progression(etat)).toEqual({ total: 2, faites: 1, pourcentage: 50 });
  });

  it("retourne 0% si aucune notion maitrisee", () => {
    expect(progression(etatCycle())).toEqual({ total: 2, faites: 0, pourcentage: 0 });
  });

  it("libelleEtape retourne des libelles FR lisibles", () => {
    expect(libelleEtape("cours")).toBe("Cours");
    expect(libelleEtape("exercices")).toBe("Exercices");
    expect(libelleEtape("recompense")).toBe("Récompense");
  });
});
