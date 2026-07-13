import { creerCapacitesMock, reinitialiserCompteurMock } from "@/adapters/ai/mock/capacitesMock";
import type { ContexteApprentissage } from "@/core/domain";
import { describe, expect, it } from "vitest";
import { tracerCapacites } from "./tracerCapacites";

const contexteMinimal = {
  domaine: { id: "maths", nom: "Mathématiques" },
  objectif: {
    id: "obj-1",
    domaineId: "maths",
    intitule: "Algèbre",
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
    miseAJour: "2026-01-01T00:00:00.000Z",
  },
  roadmap: null,
  notionCouranteId: null,
  reponsesDiagnostic: [],
} satisfies ContexteApprentissage;

describe("tracerCapacites", () => {
  it("renvoie les mêmes résultats que les capacités brutes", async () => {
    reinitialiserCompteurMock();
    const brutes = creerCapacitesMock();
    const tracees = tracerCapacites(brutes);

    const questionBrute = await brutes.diagnostic.genererQuestion(contexteMinimal);
    const questionTracee = await tracees.diagnostic.genererQuestion(contexteMinimal);

    expect(questionTracee.intitule).toBe(questionBrute.intitule);
    expect(await tracees.diagnostic.estTermine(contexteMinimal)).toBe(
      await brutes.diagnostic.estTermine(contexteMinimal),
    );
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
        enonce: "test",
        guidage: "fort",
      }, {
        exerciceId: "exo-1",
        contenu: "réponse",
      }),
    ).rejects.toBe(erreur);
  });
});
