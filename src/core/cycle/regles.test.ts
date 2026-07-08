import { describe, expect, it } from "vitest";
import type { AnalyseReponse, EtatExercices, Roadmap } from "@/core/domain";
import {
  creerRecompense,
  extraireLacune,
  mettreAJourContexte,
  notionEstMaitrisee,
  prochainGuidage,
  selectionnerNotionCourante,
} from "./regles";

const roadmap: Roadmap = {
  objectifId: "obj-1",
  version: 1,
  notions: [
    {
      id: "n1",
      titre: "Notion A",
      prerequisIds: [],
      objectifsPedagogiques: [],
      criteresDeMaitrise: [],
    },
    {
      id: "n2",
      titre: "Notion B",
      prerequisIds: ["n1"],
      objectifsPedagogiques: [],
      criteresDeMaitrise: [],
    },
    {
      id: "n3",
      titre: "Notion C",
      prerequisIds: ["n2"],
      objectifsPedagogiques: [],
      criteresDeMaitrise: [],
    },
  ],
};

function etatExercices(
  overrides: Partial<EtatExercices> = {},
): EtatExercices {
  return {
    exerciceCourant: {
      id: "exo-1",
      notionId: "n1",
      enonce: "test",
      guidage: "fort",
    },
    guidageActuel: "fort",
    tentatives: 0,
    lacuneActive: null,
    ...overrides,
  };
}

function analyse(overrides: Partial<AnalyseReponse> = {}): AnalyseReponse {
  return { correcte: true, pourquoi: "ok", ...overrides };
}

describe("regles — logique pure du cycle", () => {
  it("selectionnerNotionCourante retourne la première notion sans prérequis", () => {
    const notion = selectionnerNotionCourante(roadmap, []);
    expect(notion?.id).toBe("n1");
  });

  it("selectionnerNotionCourante respecte les prérequis", () => {
    const notion = selectionnerNotionCourante(roadmap, ["n1"]);
    expect(notion?.id).toBe("n2");
  });

  it("selectionnerNotionCourante retourne null quand tout est maîtrisé", () => {
    expect(selectionnerNotionCourante(roadmap, ["n1", "n2", "n3"])).toBeNull();
  });

  it("notionEstMaitrisee exige guidage autonome et réponse correcte", () => {
    expect(
      notionEstMaitrisee(
        etatExercices({ guidageActuel: "autonome" }),
        analyse({ correcte: true }),
      ),
    ).toBe(true);
    expect(
      notionEstMaitrisee(
        etatExercices({ guidageActuel: "modere" }),
        analyse({ correcte: true }),
      ),
    ).toBe(false);
    expect(
      notionEstMaitrisee(
        etatExercices({ guidageActuel: "autonome" }),
        analyse({ correcte: false }),
      ),
    ).toBe(false);
    expect(
      notionEstMaitrisee(
        etatExercices({ guidageActuel: "autonome", lacuneActive: "lacune" }),
        analyse({ correcte: true }),
      ),
    ).toBe(false);
  });

  it("prochainGuidage progresse fort → modere → autonome", () => {
    expect(prochainGuidage("fort", analyse())).toBe("modere");
    expect(prochainGuidage("modere", analyse())).toBe("autonome");
    expect(prochainGuidage("autonome", analyse())).toBe("autonome");
  });

  it("prochainGuidage redescend à fort en cas d'erreur", () => {
    expect(prochainGuidage("autonome", analyse({ correcte: false }))).toBe("fort");
  });

  it("extraireLacune retourne null si correcte", () => {
    expect(extraireLacune(analyse())).toBeNull();
  });

  it("extraireLacune priorise connaissanceManquante puis confusion", () => {
    expect(
      extraireLacune(
        analyse({ correcte: false, connaissanceManquante: "prérequis" }),
      ),
    ).toBe("prérequis");
    expect(
      extraireLacune(analyse({ correcte: false, confusion: "mélange" })),
    ).toBe("mélange");
  });

  it("mettreAJourContexte fusionne sans mutation", () => {
    const ctx = {
      domaine: { id: "m", nom: "Maths" },
      objectif: { id: "o", domaineId: "m", intitule: "Test", creeLe: "2026" },
      profil: {
        objectifId: "o",
        acquis: [],
        competences: [],
        lacunes: [],
        erreursFrequentes: [],
        preferencesPedagogiques: [],
        miseAJour: "2026",
      },
      roadmap: null,
      notionCouranteId: null,
      reponsesDiagnostic: [],
    };
    const misAJour = mettreAJourContexte(ctx, { notionCouranteId: "n1" });
    expect(misAJour.notionCouranteId).toBe("n1");
    expect(ctx.notionCouranteId).toBeNull();
  });

  it("creerRecompense produit un message valorisant", () => {
    const recompense = creerRecompense(roadmap.notions[0]!);
    expect(recompense.titre).toBe("Notion A");
    expect(recompense.message).toContain("Notion A");
  });
});
