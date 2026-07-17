import { describe, expect, it } from "vitest";
import { creerCapacitesMock } from "@/adapters/ai/mock/capacitesMock";
import { creerSourceFallback } from "@/adapters/knowledge/fallback";
import { creerPersistanceMemoire } from "@/adapters/persistence/memoire";
import type { ContexteApprentissage } from "@/core/domain";

function creerContexte(
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
    roadmap: null,
    notionCouranteId: null,
    reponsesDiagnostic: [],
    estimationNiveau: null,
    ...overrides,
  };
}

describe("ports — contrats implémentables hors ligne", () => {
  const capacites = creerCapacitesMock();
  const source = creerSourceFallback();
  const persistance = creerPersistanceMemoire();

  it("Diagnostic génère une question puis évalue et construit un profil", async () => {
    const contexte = creerContexte();
    const question = await capacites.diagnostic.genererQuestion(contexte, {
      difficulteCible: 3,
      competencesDejaCouvertes: [],
      estimation: null,
    });
    expect(question.id).toBeTruthy();
    expect(question.intitule).toBeTruthy();
    expect(question.competenceId).toBeTruthy();

    const reponse = { questionId: question.id, reponse: "réponse test" };
    const evaluation = await capacites.diagnostic.evaluerReponse(
      contexte,
      question,
      reponse,
    );
    expect(evaluation.maitrise).toBeTruthy();

    const contexteAvecReponses = creerContexte({
      reponsesDiagnostic: [reponse],
      estimationNiveau: {
        scoreGlobal: 60,
        competences: [],
        confiance: 0.5,
        evaluations: [evaluation],
      },
    });

    const profil = await capacites.diagnostic.construireProfil(contexteAvecReponses);
    expect(profil.objectifId).toBe("obj-1");
    expect(profil.niveauEstime).toBe(60);
  });

  it("PlanificationPedagogique génère une roadmap avec au moins une notion", async () => {
    const { roadmap } = await capacites.planification.genererRoadmap(creerContexte());
    expect(roadmap.objectifId).toBe("obj-1");
    expect(roadmap.notions.length).toBeGreaterThanOrEqual(1);
    expect(roadmap.notions[0]?.criteresDeMaitrise.length).toBeGreaterThanOrEqual(1);
  });

  it("ConcepteurDeCours compose un cours riche via le mock", async () => {
    const contexte = creerContexte();
    const { roadmap } = await capacites.planification.genererRoadmap(contexte);
    const notion = roadmap.notions[0]!;

    const cours = await capacites.concepteurDeCours.composerCours(contexte, notion);
    expect(cours.blocs.length).toBeGreaterThanOrEqual(5);
    expect(cours.blocs.some((b) => b.type === "schema")).toBe(true);
    expect(cours.blocs.some((b) => b.type === "graphique")).toBe(true);
    expect(cours.blocs.some((b) => b.type === "image")).toBe(true);
    expect(cours.blocs.some((b) => b.type === "quizFlash")).toBe(true);
  });

  it("GenerateurDeContenu produit les trois étapes du Cycle", async () => {
    const contexte = creerContexte();
    const { roadmap } = await capacites.planification.genererRoadmap(contexte);
    const notion = roadmap.notions[0]!;

    const problematique = await capacites.generateurContenu.genererProblematique(contexte, notion);
    expect(problematique.notionId).toBe(notion.id);

    const cours = await capacites.generateurContenu.genererCours(contexte, notion);
    expect(cours.blocs.length).toBeGreaterThanOrEqual(1);

    const expert = await capacites.generateurContenu.genererExempleExpert(contexte, notion);
    expect(expert.demonstration.length).toBeGreaterThanOrEqual(1);
  });

  it("boucle exercice → analyse → correction → remédiation", async () => {
    const contexte = creerContexte();
    const { roadmap } = await capacites.planification.genererRoadmap(contexte);
    const notion = roadmap.notions[0]!;

    const exercice = await capacites.generateurExercices.genererExercice(
      contexte,
      notion,
      "fort",
    );
    const analyse = await capacites.analyseurErreurs.analyser(contexte, exercice, {
      exerciceId: exercice.id,
      contenu: "ma réponse",
    });
    const correction = await capacites.correcteur.corriger(contexte, exercice, analyse);
    expect(correction.explicationPersonnalisee).toBeTruthy();

    const exerciceCible = await capacites.remediation.genererExerciceCible(
      contexte,
      notion,
      "confusion sur les prérequis",
    );
    expect(exerciceCible.cibleLacune).toBe("confusion sur les prérequis");
    expect(exerciceCible.guidage).toBe("fort");
  });

  it("Adaptation fait évoluer profil et roadmap", async () => {
    const contexte = creerContexte();
    const { roadmap: roadmapInitiale } =
      await capacites.planification.genererRoadmap(contexte);
    const resultat = await capacites.adaptation.adapter({
      ...contexte,
      roadmap: roadmapInitiale,
    });
    expect(resultat.profil.objectifId).toBe("obj-1");
    expect(resultat.roadmap.notions.length).toBeGreaterThanOrEqual(1);
  });

  it("SourceDeConnaissances fallback signale l'absence de Bible", async () => {
    expect(await source.estDisponible("japonais")).toBe(false);
    expect(await source.rechercher("japonais", "hiragana")).toEqual([]);
  });

  it("Persistance sauvegarde et recharge profil, roadmap et objectifs", async () => {
    const contexte = creerContexte();
    const profil = await capacites.diagnostic.construireProfil(contexte);
    await persistance.sauvegarderProfil(profil);
    expect(await persistance.chargerProfil("obj-1")).toEqual(profil);

    const { roadmap } = await capacites.planification.genererRoadmap(contexte);
    await persistance.sauvegarderRoadmap(roadmap);
    expect(await persistance.chargerRoadmap("obj-1")).toEqual(roadmap);

    await persistance.sauvegarderObjectif(contexte.objectif);
    const objectifs = await persistance.chargerObjectifs("japonais");
    expect(objectifs).toHaveLength(1);
    expect(objectifs[0]?.intitule).toBe("JLPT N5");
  });

  it("Persistance sauvegarde le profil élève transversal", async () => {
    const champs = {
      typeMemoire: "litteraire" as const,
      pointsForts: ["lecture"],
      pointsFaibles: [],
      niveauxParDomaine: {},
    };
    await persistance.sauvegarderProfilEleve(champs);
    expect(await persistance.chargerProfilEleve()).toEqual(champs);
  });
});
