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

describe("OrchestrateurParcours", () => {
  beforeEach(() => {
    reinitialiserCompteurMock();
  });

  it("demarrer lance le diagnostic avec une question", async () => {
    const capacites = creerCapacitesMock();
    const parcours = new OrchestrateurParcours(capacites);

    const etat = await parcours.demarrer(domaine, objectif);
    expect(etat.phase).toBe("diagnostic");
    expect(etat.questionCourante).toBeTruthy();
    expect(etat.contexte.reponsesDiagnostic).toHaveLength(0);
    expect(etat.contexte.roadmap).toBeNull();
  });

  it("termine le diagnostic après 2 réponses et produit un contexte prêt", async () => {
    const capacites = creerCapacitesMock();
    const parcours = new OrchestrateurParcours(capacites);

    let etat = await parcours.demarrer(domaine, objectif);

    etat = await parcours.repondre(etat, {
      questionId: etat.questionCourante!.id,
      reponse: "réponse 1",
    });
    expect(etat.phase).toBe("diagnostic");
    expect(etat.questionCourante).toBeTruthy();

    etat = await parcours.repondre(etat, {
      questionId: etat.questionCourante!.id,
      reponse: "réponse 2",
    });
    expect(etat.phase).toBe("pret");
    expect(etat.questionCourante).toBeNull();
    expect(etat.contexte.roadmap).not.toBeNull();
    expect(etat.contexte.profil.objectifId).toBe("obj-1");
    expect(etat.contexte.reponsesDiagnostic).toHaveLength(2);
  });

  it("rejette une réponse pour une question différente", async () => {
    const parcours = new OrchestrateurParcours(creerCapacitesMock());
    const etat = await parcours.demarrer(domaine, objectif);

    await expect(
      parcours.repondre(etat, { questionId: "q-invalide", reponse: "réponse" }),
    ).rejects.toThrow("La réponse ne correspond pas à la question courante");
  });

  it("rejette repondre en phase pret", async () => {
    const parcours = new OrchestrateurParcours(creerCapacitesMock());
    let etat = await parcours.demarrer(domaine, objectif);

    etat = await parcours.repondre(etat, {
      questionId: etat.questionCourante!.id,
      reponse: "r1",
    });
    etat = await parcours.repondre(etat, {
      questionId: etat.questionCourante!.id,
      reponse: "r2",
    });
    expect(etat.phase).toBe("pret");

    await expect(
      parcours.repondre(etat, { questionId: "q-1", reponse: "trop tard" }),
    ).rejects.toThrow("repondre n'est disponible qu'en phase diagnostic");
  });

  it("persiste objectif, profil et roadmap au passage en phase pret", async () => {
    const capacites = creerCapacitesMock();
    const persistance = creerPersistanceMemoire();
    const parcours = new OrchestrateurParcours({ ...capacites, persistance });

    let etat = await parcours.demarrer(domaine, objectif);
    etat = await parcours.repondre(etat, {
      questionId: etat.questionCourante!.id,
      reponse: "r1",
    });
    etat = await parcours.repondre(etat, {
      questionId: etat.questionCourante!.id,
      reponse: "r2",
    });

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

    let etatParcours = await parcours.demarrer(domaine, objectif);
    etatParcours = await parcours.repondre(etatParcours, {
      questionId: etatParcours.questionCourante!.id,
      reponse: "r1",
    });
    etatParcours = await parcours.repondre(etatParcours, {
      questionId: etatParcours.questionCourante!.id,
      reponse: "r2",
    });

    const etatCycle = await cycle.demarrer(etatParcours.contexte);
    expect(etatCycle.etape).toBe("problematique");
    expect(etatCycle.contexte.roadmap).not.toBeNull();
    expect(etatCycle.termine).toBe(false);
  });
});
