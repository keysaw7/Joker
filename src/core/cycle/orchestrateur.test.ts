import { beforeEach, describe, expect, it } from "vitest";
import {
  creerDependancesCycleMock,
  reinitialiserCompteurMock,
} from "@/adapters/ai/mock/capacitesMock";
import { creerPersistanceMemoire } from "@/adapters/persistence/memoire";
import { OrchestrateurCycle } from "@/core/cycle/orchestrateur";
import type {
  ContexteApprentissage,
  Exercice,
  ReponseApprenant,
  Roadmap,
} from "@/core/domain";

function creerRoadmap(notions: Roadmap["notions"]): Roadmap {
  return { objectifId: "obj-1", version: 1, notions };
}

function creerContexte(
  roadmap: Roadmap,
  overrides: Partial<ContexteApprentissage> = {},
): ContexteApprentissage {
  return {
    domaine: { id: "japonais", nom: "Japonais" },
    objectif: {
      id: "obj-1",
      domaineId: "japonais",
      intitule: "JLPT N5",
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
    roadmap,
    notionCouranteId: null,
    reponsesDiagnostic: [],
    estimationNiveau: null,
    modeleApprenant: null,
    grapheCompetences: null,
    ...overrides,
  };
}

function reponsePourExercice(
  exercice: Exercice,
  correcte: boolean,
): ReponseApprenant {
  switch (exercice.format) {
    case "qcm":
      return {
        exerciceId: exercice.id,
        format: "qcm",
        indexChoisi: correcte
          ? exercice.bonneReponse
          : (exercice.bonneReponse + 1) % exercice.options.length,
      };
    case "trous": {
      const remplissages: Record<string, string[]> = {};
      for (const phrase of exercice.phrases) {
        remplissages[phrase.id] = [
          correcte ? (phrase.solutions[0] ?? "") : "mauvais",
        ];
      }
      return { exerciceId: exercice.id, format: "trous", remplissages };
    }
    case "appariement": {
      const associations: Record<string, string> = {};
      for (const paire of exercice.paires) {
        associations[paire.id] = correcte ? paire.droite : "xxx";
      }
      return { exerciceId: exercice.id, format: "appariement", associations };
    }
    case "production_libre":
      return {
        exerciceId: exercice.id,
        format: "production_libre",
        contenu: correcte ? "bonne réponse" : "mauvaise réponse",
      };
  }
}

async function avancerJusquAuxExercices(
  orchestrateur: OrchestrateurCycle,
  contexte: ContexteApprentissage,
) {
  let etat = await orchestrateur.demarrer(contexte);
  etat = await orchestrateur.avancer(etat);
  etat = await orchestrateur.avancer(etat);
  return orchestrateur.avancer(etat);
}

async function maitriserNotion(
  orchestrateur: OrchestrateurCycle,
  contexte: ContexteApprentissage,
) {
  let etat = await avancerJusquAuxExercices(orchestrateur, contexte);
  for (let i = 0; i < 3; i++) {
    const exercice = etat.etatExercices!.exerciceCourant;
    etat = await orchestrateur.repondreExercice(
      etat,
      reponsePourExercice(exercice, true),
    );
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
      titre: "Salutations",
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
    const orchestrateur = new OrchestrateurCycle(creerDependancesCycleMock());
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
    expect(etat.etatExercices?.exerciceCourant.format).toBe("qcm");

    etat = await maitriserNotion(orchestrateur, contexte);
    expect(etat.etape).toBe("recompense");
    expect(etat.contexte.profil.notionsMaitrisees).toContain("n1");
    expect(etat.contenu.type).toBe("recompense");
    if (etat.contenu.type === "recompense") {
      expect(etat.contenu.correctionPrecedente).toBeDefined();
    }
  });

  it("initialise le guidage des exercices selon le niveau diagnostic", async () => {
    const orchestrateur = new OrchestrateurCycle(creerDependancesCycleMock());
    const base = creerContexte(roadmapSimple);
    const contexte = creerContexte(roadmapSimple, {
      profil: { ...base.profil, niveauEstime: 80 },
    });

    const etat = await avancerJusquAuxExercices(orchestrateur, contexte);
    expect(etat.etatExercices?.guidageActuel).toBe("autonome");
    expect(etat.etatExercices?.exerciceCourant.format).toBe("production_libre");
  });

  it("rejette demarrer sans roadmap", async () => {
    const orchestrateur = new OrchestrateurCycle(creerDependancesCycleMock());
    const contexte = creerContexte(roadmapSimple, { roadmap: null });
    await expect(orchestrateur.demarrer(contexte)).rejects.toThrow(
      "L'orchestrateur du Cycle requiert une roadmap",
    );
  });

  it("rejette une réponse pour un exercice différent", async () => {
    const orchestrateur = new OrchestrateurCycle(creerDependancesCycleMock());
    const etat = await avancerJusquAuxExercices(
      orchestrateur,
      creerContexte(roadmapSimple),
    );
    await expect(
      orchestrateur.repondreExercice(etat, {
        exerciceId: "exo-invalide",
        format: "qcm",
        indexChoisi: 0,
      }),
    ).rejects.toThrow("La réponse ne correspond pas à l'exercice courant");
  });

  it("déclenche la remédiation sur réponse incorrecte (format fermé)", async () => {
    const orchestrateur = new OrchestrateurCycle(creerDependancesCycleMock());
    const contexte = creerContexte(roadmapSimple);

    let etat = await avancerJusquAuxExercices(orchestrateur, contexte);
    const exercice = etat.etatExercices!.exerciceCourant;
    etat = await orchestrateur.repondreExercice(
      etat,
      reponsePourExercice(exercice, false),
    );

    expect(etat.etape).toBe("exercices");
    expect(etat.etatExercices?.lacuneActive).toBeTruthy();
    expect(etat.etatExercices?.guidageActuel).toBe("fort");
    expect(etat.contexte.profil.lacunes).toHaveLength(1);
    expect(etat.contenu.type).toBe("exercice");
    if (etat.contenu.type === "exercice") {
      expect(etat.contenu.exercice.cibleLacune).toBeTruthy();
      expect(etat.contenu.correctionPrecedente).toBeDefined();
      expect(etat.contenu.correctionPrecedente?.items.length).toBeGreaterThan(0);
    }
  });

  it("ignore notionCouranteId si les prérequis ne sont pas satisfaits", async () => {
    const orchestrateur = new OrchestrateurCycle(creerDependancesCycleMock());
    const contexte = creerContexte(roadmapDouble, { notionCouranteId: "n2" });

    const etat = await orchestrateur.demarrer(contexte);
    expect(etat.contexte.notionCouranteId).toBe("n1");
  });

  it("progresse le guidage fort → modere → autonome", async () => {
    const orchestrateur = new OrchestrateurCycle(creerDependancesCycleMock());
    const contexte = creerContexte(roadmapSimple);

    let etat = await avancerJusquAuxExercices(orchestrateur, contexte);
    expect(etat.etatExercices?.guidageActuel).toBe("fort");

    etat = await orchestrateur.repondreExercice(
      etat,
      reponsePourExercice(etat.etatExercices!.exerciceCourant, true),
    );
    expect(etat.etatExercices?.guidageActuel).toBe("modere");

    etat = await orchestrateur.repondreExercice(
      etat,
      reponsePourExercice(etat.etatExercices!.exerciceCourant, true),
    );
    expect(etat.etatExercices?.guidageActuel).toBe("autonome");
  });

  it("bloque la maîtrise si réponse incorrecte en guidage autonome", async () => {
    const orchestrateur = new OrchestrateurCycle(
      creerDependancesCycleMock({
        analyser: async () => ({
          correcte: false,
          pourquoi: "erreur en autonome",
          confusion: "mélange",
        }),
      }),
    );
    const contexte = creerContexte(roadmapSimple);

    let etat = await avancerJusquAuxExercices(orchestrateur, contexte);
    etat = await orchestrateur.repondreExercice(
      etat,
      reponsePourExercice(etat.etatExercices!.exerciceCourant, true),
    );
    etat = await orchestrateur.repondreExercice(
      etat,
      reponsePourExercice(etat.etatExercices!.exerciceCourant, true),
    );
    expect(etat.etatExercices?.guidageActuel).toBe("autonome");
    expect(etat.etatExercices?.exerciceCourant.format).toBe("production_libre");

    etat = await orchestrateur.repondreExercice(
      etat,
      reponsePourExercice(etat.etatExercices!.exerciceCourant, false),
    );
    expect(etat.etape).toBe("exercices");
    expect(etat.etatExercices?.guidageActuel).toBe("fort");
    expect(etat.contexte.profil.notionsMaitrisees).toHaveLength(0);
  });

  it("passe à la notion suivante après récompense", async () => {
    const orchestrateur = new OrchestrateurCycle(creerDependancesCycleMock());
    const contexte = creerContexte(roadmapDouble);

    let etat = await maitriserNotion(orchestrateur, contexte);
    expect(etat.etape).toBe("recompense");
    expect(etat.contexte.profil.notionsMaitrisees).toEqual(["n1"]);

    etat = await orchestrateur.terminerEtPasserSuivant(etat);
    expect(etat.termine).toBe(false);
    expect(etat.etape).toBe("problematique");
    expect(etat.contexte.notionCouranteId).toBe("n2");
  });

  it("termine le parcours quand toutes les notions sont maîtrisées", async () => {
    const orchestrateur = new OrchestrateurCycle(creerDependancesCycleMock());
    const contexte = creerContexte(roadmapDouble);

    let etat = await maitriserNotion(orchestrateur, contexte);
    etat = await orchestrateur.terminerEtPasserSuivant(etat);

    etat = await maitriserNotion(orchestrateur, etat.contexte);
    expect(etat.contexte.profil.notionsMaitrisees).toEqual(["n1", "n2"]);

    etat = await orchestrateur.terminerEtPasserSuivant(etat);
    expect(etat.termine).toBe(true);
    expect(etat.contenu.type).toBe("recompense");
    if (etat.contenu.type === "recompense") {
      expect(etat.contenu.recompense.titre).toBe("Parcours terminé");
    }
  });

  it("persiste profil, objectif et roadmap après maîtrise d'une notion", async () => {
    const persistance = creerPersistanceMemoire();
    const orchestrateur = new OrchestrateurCycle({
      ...creerDependancesCycleMock(),
      persistance,
    });
    const contexte = creerContexte(roadmapSimple);

    const etat = await maitriserNotion(orchestrateur, contexte);
    expect(etat.etape).toBe("recompense");

    const profil = await persistance.chargerProfil("obj-1");
    const roadmap = await persistance.chargerRoadmap("obj-1");
    const objectifs = await persistance.chargerObjectifs("japonais");
    expect(profil).not.toBeNull();
    expect(profil?.notionsMaitrisees).toContain("n1");
    expect(roadmap).not.toBeNull();
    expect(objectifs).toHaveLength(1);
  });
});
