import { beforeEach, describe, expect, it } from "vitest";
import {
  creerCapacitesMock,
  reinitialiserCompteurMock,
} from "@/adapters/ai/mock/capacitesMock";
import { creerPersistanceMemoire } from "@/adapters/persistence/memoire";
import { OrchestrateurCycle } from "@/core/cycle/orchestrateur";
import { OrchestrateurParcours } from "@/core/parcours/orchestrateurParcours";

const domaine = { id: "maths", nom: "Mathématiques" };
const objectif = {
  id: "obj-1",
  domaineId: "maths",
  intitule: "Comprendre les dérivées",
  creeLe: "2026-01-01T00:00:00.000Z",
};

function reponsesPourQuestions(
  questions: readonly { id: string }[],
): { questionId: string; reponse: string }[] {
  return questions.map((question, index) => ({
    questionId: question.id,
    reponse: `réponse ${index + 1}`,
  }));
}

describe("OrchestrateurParcours", () => {
  beforeEach(() => {
    reinitialiserCompteurMock();
  });

  it("demarrer lance le diagnostic avec 5 questions pré-générées", async () => {
    const capacites = creerCapacitesMock();
    const parcours = new OrchestrateurParcours(capacites);

    const etat = await parcours.demarrer(domaine, objectif);
    expect(etat.phase).toBe("diagnostic");
    expect(etat.questions).toHaveLength(5);
    expect(etat.contexte.reponsesDiagnostic).toHaveLength(0);
    expect(etat.contexte.roadmap).toBeNull();
  });

  it("finalise le diagnostic avec 5 réponses et produit un contexte prêt", async () => {
    const capacites = creerCapacitesMock();
    const parcours = new OrchestrateurParcours(capacites);

    const etatInitial = await parcours.demarrer(domaine, objectif);
    const etat = await parcours.finaliserDiagnostic(
      etatInitial,
      reponsesPourQuestions(etatInitial.questions),
    );

    expect(etat.phase).toBe("pret");
    expect(etat.questions).toHaveLength(0);
    expect(etat.contexte.roadmap).not.toBeNull();
    expect(etat.contexte.profil.objectifId).toBe("obj-1");
    expect(etat.contexte.reponsesDiagnostic).toHaveLength(5);
  });

  it("rejette des réponses pour des questions différentes", async () => {
    const parcours = new OrchestrateurParcours(creerCapacitesMock());
    const etat = await parcours.demarrer(domaine, objectif);

    await expect(
      parcours.finaliserDiagnostic(etat, [
        { questionId: "q-invalide", reponse: "réponse" },
      ]),
    ).rejects.toThrow("Nombre de réponses incorrect");
  });

  it("rejette finaliserDiagnostic en phase pret", async () => {
    const parcours = new OrchestrateurParcours(creerCapacitesMock());
    const etatInitial = await parcours.demarrer(domaine, objectif);
    const etat = await parcours.finaliserDiagnostic(
      etatInitial,
      reponsesPourQuestions(etatInitial.questions),
    );
    expect(etat.phase).toBe("pret");

    await expect(
      parcours.finaliserDiagnostic(etat, [{ questionId: "q-1", reponse: "trop tard" }]),
    ).rejects.toThrow("finaliserDiagnostic n'est disponible qu'en phase diagnostic");
  });

  it("persiste objectif, profil et roadmap au passage en phase pret", async () => {
    const capacites = creerCapacitesMock();
    const persistance = creerPersistanceMemoire();
    const parcours = new OrchestrateurParcours({ ...capacites, persistance });

    const etatInitial = await parcours.demarrer(domaine, objectif);
    await parcours.finaliserDiagnostic(
      etatInitial,
      reponsesPourQuestions(etatInitial.questions),
    );

    const profil = await persistance.chargerProfil("obj-1");
    const roadmap = await persistance.chargerRoadmap("obj-1");
    const objectifs = await persistance.chargerObjectifs("maths");
    expect(profil).not.toBeNull();
    expect(roadmap).not.toBeNull();
    expect(objectifs).toHaveLength(1);
  });

  it("handshake : le contexte pret est accepté par OrchestrateurCycle", async () => {
    const capacites = creerCapacitesMock();
    const parcours = new OrchestrateurParcours(capacites);
    const cycle = new OrchestrateurCycle(capacites);

    const etatInitial = await parcours.demarrer(domaine, objectif);
    const etatParcours = await parcours.finaliserDiagnostic(
      etatInitial,
      reponsesPourQuestions(etatInitial.questions),
    );

    const etatCycle = await cycle.demarrer(etatParcours.contexte);
    expect(etatCycle.etape).toBe("problematique");
    expect(etatCycle.contexte.roadmap).not.toBeNull();
    expect(etatCycle.termine).toBe(false);
  });
});
