import { beforeEach, describe, expect, it } from "vitest";
import {
  creerCapacitesMock,
  reinitialiserCompteurMock,
} from "@/adapters/ai/mock/capacitesMock";
import { creerPersistanceMemoire } from "@/adapters/persistence/memoire";
import { OrchestrateurCycle } from "@/core/cycle/orchestrateur";
import type { ContexteApprentissage, Roadmap } from "@/core/domain";

function creerRoadmap(notions: Roadmap["notions"]): Roadmap {
  return { objectifId: "obj-1", version: 1, notions };
}

function creerContexte(roadmap: Roadmap): ContexteApprentissage {
  return {
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
      miseAJour: "2026-01-01T00:00:00.000Z",
    },
    roadmap,
    notionCouranteId: null,
    reponsesDiagnostic: [],
  };
}

async function avancerJusquAuxExercices(
  orchestrateur: OrchestrateurCycle,
  contexte: ContexteApprentissage,
  notionsMaitrisees: readonly string[] = [],
) {
  let etat = await orchestrateur.demarrer(contexte, notionsMaitrisees);
  etat = await orchestrateur.avancer(etat);
  etat = await orchestrateur.avancer(etat);
  return orchestrateur.avancer(etat);
}

async function maitriserNotion(
  orchestrateur: OrchestrateurCycle,
  contexte: ContexteApprentissage,
  notionsMaitrisees: readonly string[] = [],
) {
  let etat = await avancerJusquAuxExercices(
    orchestrateur,
    contexte,
    notionsMaitrisees,
  );
  for (let i = 0; i < 3; i++) {
    etat = await orchestrateur.repondreExercice(etat, {
      exerciceId: etat.etatExercices!.exerciceCourant.id,
      contenu: `réponse ${i}`,
    });
    if (etat.etape === "recompense") {
      return etat;
    }
  }
  return etat;
}

describe("OrchestrateurCycle", () => {
  beforeEach(() => {
    reinitialiserCompteurMock();
  });

  const roadmapSimple = creerRoadmap([
    {
      id: "n1",
      titre: "Les dérivées",
      prerequisIds: [],
      objectifsPedagogiques: [],
      criteresDeMaitrise: [{ id: "c1", description: "Exercice autonome réussi" }],
    },
  ]);

  const roadmapDouble = creerRoadmap([
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
  ]);

  it("enchaîne le cycle complet 5→9", async () => {
    const capacites = creerCapacitesMock();
    const orchestrateur = new OrchestrateurCycle(capacites);
    const contexte = creerContexte(roadmapSimple);

    let etat = await orchestrateur.demarrer(contexte);
    expect(etat.etape).toBe("problematique");
    expect(etat.contenu.type).toBe("problematique");

    etat = await orchestrateur.avancer(etat);
    expect(etat.etape).toBe("cours");

    etat = await orchestrateur.avancer(etat);
    expect(etat.etape).toBe("exempleExpert");

    etat = await orchestrateur.avancer(etat);
    expect(etat.etape).toBe("exercices");
    expect(etat.etatExercices?.guidageActuel).toBe("fort");

    etat = await maitriserNotion(orchestrateur, contexte);
    expect(etat.etape).toBe("recompense");
    expect(etat.notionsMaitrisees).toContain("n1");
    expect(etat.contenu.type).toBe("recompense");
  });

  it("déclenche la remédiation sur réponse incorrecte", async () => {
    const capacites = creerCapacitesMock({
      analyser: async () => ({
        correcte: false,
        pourquoi: "Confusion sur les prérequis",
        connaissanceManquante: "confusion sur les prérequis",
      }),
    });
    const orchestrateur = new OrchestrateurCycle(capacites);
    const contexte = creerContexte(roadmapSimple);

    let etat = await avancerJusquAuxExercices(orchestrateur, contexte);
    etat = await orchestrateur.repondreExercice(etat, {
      exerciceId: etat.etatExercices!.exerciceCourant.id,
      contenu: "mauvaise réponse",
    });

    expect(etat.etape).toBe("exercices");
    expect(etat.etatExercices?.lacuneActive).toBe("confusion sur les prérequis");
    expect(etat.etatExercices?.guidageActuel).toBe("fort");
    expect(etat.contenu.type).toBe("exercice");
    if (etat.contenu.type === "exercice") {
      expect(etat.contenu.exercice.cibleLacune).toBe("confusion sur les prérequis");
      expect(etat.contenu.correctionPrecedente).toBeDefined();
    }
  });

  it("progresse le guidage fort → modere → autonome", async () => {
    const capacites = creerCapacitesMock();
    const orchestrateur = new OrchestrateurCycle(capacites);
    const contexte = creerContexte(roadmapSimple);

    let etat = await avancerJusquAuxExercices(orchestrateur, contexte);
    expect(etat.etatExercices?.guidageActuel).toBe("fort");

    etat = await orchestrateur.repondreExercice(etat, {
      exerciceId: etat.etatExercices!.exerciceCourant.id,
      contenu: "réponse 1",
    });
    expect(etat.etatExercices?.guidageActuel).toBe("modere");

    etat = await orchestrateur.repondreExercice(etat, {
      exerciceId: etat.etatExercices!.exerciceCourant.id,
      contenu: "réponse 2",
    });
    expect(etat.etatExercices?.guidageActuel).toBe("autonome");
  });

  it("bloque la maîtrise si réponse incorrecte en guidage autonome", async () => {
    let appels = 0;
    const capacites = creerCapacitesMock({
      analyser: async (_ctx, _exo, _rep) => {
        appels += 1;
        if (appels <= 2) {
          return { correcte: true, pourquoi: "ok" };
        }
        return { correcte: false, pourquoi: "erreur en autonome", confusion: "mélange" };
      },
    });
    const orchestrateur = new OrchestrateurCycle(capacites);
    const contexte = creerContexte(roadmapSimple);

    let etat = await avancerJusquAuxExercices(orchestrateur, contexte);
    etat = await orchestrateur.repondreExercice(etat, {
      exerciceId: etat.etatExercices!.exerciceCourant.id,
      contenu: "r1",
    });
    etat = await orchestrateur.repondreExercice(etat, {
      exerciceId: etat.etatExercices!.exerciceCourant.id,
      contenu: "r2",
    });
    expect(etat.etatExercices?.guidageActuel).toBe("autonome");

    etat = await orchestrateur.repondreExercice(etat, {
      exerciceId: etat.etatExercices!.exerciceCourant.id,
      contenu: "r3 incorrecte",
    });
    expect(etat.etape).toBe("exercices");
    expect(etat.etatExercices?.guidageActuel).toBe("fort");
    expect(etat.notionsMaitrisees).toHaveLength(0);
  });

  it("passe à la notion suivante après récompense", async () => {
    const capacites = creerCapacitesMock();
    const orchestrateur = new OrchestrateurCycle(capacites);
    const contexte = creerContexte(roadmapDouble);

    let etat = await maitriserNotion(orchestrateur, contexte);
    expect(etat.etape).toBe("recompense");
    expect(etat.notionsMaitrisees).toEqual(["n1"]);

    etat = await orchestrateur.terminerEtPasserSuivant(etat);
    expect(etat.termine).toBe(false);
    expect(etat.etape).toBe("problematique");
    expect(etat.contexte.notionCouranteId).toBe("n2");
  });

  it("termine le parcours quand toutes les notions sont maîtrisées", async () => {
    const capacites = creerCapacitesMock();
    const orchestrateur = new OrchestrateurCycle(capacites);
    const contexte = creerContexte(roadmapDouble);

    let etat = await maitriserNotion(orchestrateur, contexte);
    etat = await orchestrateur.terminerEtPasserSuivant(etat);

    const contexteN2 = etat.contexte;
    etat = await maitriserNotion(orchestrateur, contexteN2, etat.notionsMaitrisees);
    expect(etat.notionsMaitrisees).toEqual(["n1", "n2"]);

    etat = await orchestrateur.terminerEtPasserSuivant(etat);
    expect(etat.termine).toBe(true);
    expect(etat.contenu.type).toBe("recompense");
    if (etat.contenu.type === "recompense") {
      expect(etat.contenu.recompense.titre).toBe("Parcours terminé");
    }
  });

  it("persiste profil et roadmap après maîtrise d'une notion", async () => {
    const capacites = creerCapacitesMock();
    const persistance = creerPersistanceMemoire();
    const orchestrateur = new OrchestrateurCycle({ ...capacites, persistance });
    const contexte = creerContexte(roadmapSimple);

    const etat = await maitriserNotion(orchestrateur, contexte);
    expect(etat.etape).toBe("recompense");

    const profil = await persistance.chargerProfil("obj-1");
    const roadmap = await persistance.chargerRoadmap("obj-1");
    expect(profil).not.toBeNull();
    expect(roadmap).not.toBeNull();
  });
});
