import { creerCapacitesMock, reinitialiserCompteurMock } from "@/adapters/ai/mock/capacitesMock";
import type { ContexteApprentissage } from "@/core/domain";
import { describe, expect, it } from "vitest";
import { tracerCapacites } from "./tracerCapacites";

const contexteMinimal = {
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
    modeleApprenant: null,
    grapheCompetences: null,
} satisfies ContexteApprentissage;

describe("tracerCapacites", () => {
  it("renvoie les mêmes résultats que les capacités brutes", async () => {
    reinitialiserCompteurMock();
    const brutes = creerCapacitesMock();
    const tracees = tracerCapacites(brutes);

    const questionBrute = await brutes.diagnostic.genererQuestion(contexteMinimal, {
      difficulteCible: 3,
      competencesDejaCouvertes: [],
      estimation: null,
    });
    const questionTracee = await tracees.diagnostic.genererQuestion(contexteMinimal, {
      difficulteCible: 3,
      competencesDejaCouvertes: [],
      estimation: null,
    });

    expect(questionTracee.intitule).toBe(questionBrute.intitule);
  });

  it("relance les erreurs sans les modifier", async () => {
    const erreur = new Error("échec simulé");
    const tracees = tracerCapacites(
      creerCapacitesMock({
        analyser: async () => {
          throw erreur;
        },
      }),
    );

    await expect(
      tracees.analyseurErreurs.analyser(contexteMinimal, {
        id: "exo-1",
        notionId: "notion-1",
        format: "production_libre",
        consigne: "test",
        enonce: "test",
        guidage: "fort",
      }, {
        exerciceId: "exo-1",
        format: "production_libre",
        contenu: "réponse",
      }),
    ).rejects.toBe(erreur);
  });
});
