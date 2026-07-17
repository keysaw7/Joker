import { describe, expect, it } from "vitest";
import type { AnalyseReponse, EtatExercices, ProfilApprenant, Roadmap } from "@/core/domain";
import { croyanceInitiale, modeleApprenantInitial } from "@/core/domain";
import {
  choisirFormatExercice,
  creerRecompense,
  enrichirProfil,
  extraireLacune,
  marquerNotionMaitrisee,
  mettreAJourContexte,
  notionEstMaitrisee,
  prerequisSatisfaits,
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

function profil(overrides: Partial<ProfilApprenant> = {}): ProfilApprenant {
  return {
    objectifId: "obj-1",
    acquis: [],
    competences: [],
    lacunes: [],
    erreursFrequentes: [],
    preferencesPedagogiques: [],
    notionsMaitrisees: [],
    niveauEstime: null,
    miseAJour: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function etatExercices(
  overrides: Partial<EtatExercices> = {},
): EtatExercices {
  return {
    exerciceCourant: {
      id: "exo-1",
      notionId: "n1",
      format: "qcm",
      consigne: "test",
      question: "Quelle option ?",
      options: ["A", "B"],
      bonneReponse: 0,
      guidage: "fort",
    },
    guidageActuel: "fort",
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

  it("prerequisSatisfaits vérifie les prérequis maîtrisés", () => {
    expect(prerequisSatisfaits(roadmap.notions[0]!, [])).toBe(true);
    expect(prerequisSatisfaits(roadmap.notions[1]!, [])).toBe(false);
    expect(prerequisSatisfaits(roadmap.notions[1]!, ["n1"])).toBe(true);
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
        notionsMaitrisees: [],
    niveauEstime: null,
        miseAJour: "2026",
      },
      roadmap: null,
      notionCouranteId: null,
      reponsesDiagnostic: [],
      estimationNiveau: null,
    modeleApprenant: null,
    grapheCompetences: null,
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

  it("enrichirProfil ajoute une lacune et une erreur cognitive si incorrecte", () => {
    const notion = roadmap.notions[0]!;
    const enrichi = enrichirProfil(
      profil(),
      analyse({
        correcte: false,
        connaissanceManquante: "prérequis manquant",
        erreurCognitive: "mélange de concepts",
      }),
      notion,
    );
    expect(enrichi.lacunes).toHaveLength(1);
    expect(enrichi.lacunes[0]?.sujet).toBe("Notion A");
    expect(enrichi.lacunes[0]?.description).toBe("prérequis manquant");
    expect(enrichi.erreursFrequentes).toContain("mélange de concepts");
  });

  it("enrichirProfil ne modifie pas les lacunes si réponse correcte", () => {
    const enrichi = enrichirProfil(profil(), analyse(), roadmap.notions[0]!);
    expect(enrichi.lacunes).toHaveLength(0);
    expect(enrichi.erreursFrequentes).toHaveLength(0);
  });

  it("marquerNotionMaitrisee ajoute la notion et purge les lacunes associées", () => {
    const notion = roadmap.notions[0]!;
    const avecLacune = profil({
      lacunes: [{ sujet: "Notion A", description: "confusion" }],
    });
    const marque = marquerNotionMaitrisee(avecLacune, notion);
    expect(marque.notionsMaitrisees).toEqual(["n1"]);
    expect(marque.lacunes).toHaveLength(0);
  });

  it("choisirFormatExercice suit le mapping guidage par défaut", () => {
    expect(choisirFormatExercice("fort")).toBe("qcm");
    expect(choisirFormatExercice("modere")).toBe("trous");
    expect(choisirFormatExercice("autonome")).toBe("production_libre");
    expect(choisirFormatExercice("autonome", null, { remediation: true })).toBe(
      "qcm",
    );
  });

  it("choisirFormatExercice biaise selon efficaciteParFormat du LM", () => {
    const modele = modeleApprenantInitial("obj-1");
    const modeleBiaise = {
      ...modele,
      preferences: {
        ...modele.preferences,
        efficaciteParFormat: {
          trous: { ...croyanceInitiale("trous"), alpha: 8, beta: 2 },
          qcm: { ...croyanceInitiale("qcm"), alpha: 2, beta: 8 },
        },
      },
    };
    expect(choisirFormatExercice("fort", modeleBiaise)).toBe("trous");
  });
});
