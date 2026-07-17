import { beforeEach, describe, expect, it } from "vitest";
import {
  creerCapacitesMock,
  reinitialiserCompteurMock,
} from "@/adapters/ai/mock/capacitesMock";
import { creerPersistanceMemoire } from "@/adapters/persistence/memoire";
import { OrchestrateurCycle } from "@/core/cycle/orchestrateur";
import { MIN_QUESTIONS } from "@/core/parcours/reglesDiagnostic";
import { OrchestrateurParcours } from "@/core/parcours/orchestrateurParcours";

const domaine = { id: "japonais", nom: "Japonais" };
const objectif = {
  id: "obj-1",
  domaineId: "japonais",
  intitule: "JLPT N5",
  creeLe: "2026-01-01T00:00:00.000Z",
};

async function menerDiagnosticComplet(
  parcours: OrchestrateurParcours,
): Promise<import("@/core/domain").EtatParcours> {
  let etat = await parcours.demarrer(domaine, objectif);
  expect(etat.phase).toBe("diagnostic");
  expect(etat.questionCourante).not.toBeNull();

  for (let i = 0; i < MIN_QUESTIONS + 2; i++) {
    const resultat = await parcours.repondre(etat, `réponse mock ${i + 1}`);
    etat = resultat.etat;
    if (resultat.termine) {
      return etat;
    }
  }
  throw new Error("Diagnostic mock n'a pas terminé à temps");
}

describe("OrchestrateurParcours", () => {
  beforeEach(() => {
    reinitialiserCompteurMock();
  });

  it("demarrer lance le diagnostic avec une première question", async () => {
    const parcours = new OrchestrateurParcours(creerCapacitesMock());

    const etat = await parcours.demarrer(domaine, objectif);
    expect(etat.phase).toBe("diagnostic");
    expect(etat.questionCourante).not.toBeNull();
    expect(etat.questionsPosees).toBe(0);
    expect(etat.contexte.reponsesDiagnostic).toHaveLength(0);
    expect(etat.contexte.roadmap).toBeNull();
  });

  it("termine le diagnostic adaptatif et produit un contexte prêt", async () => {
    const parcours = new OrchestrateurParcours(creerCapacitesMock());
    const etat = await menerDiagnosticComplet(parcours);

    expect(etat.phase).toBe("pret");
    expect(etat.questionCourante).toBeNull();
    expect(etat.contexte.roadmap).not.toBeNull();
    expect(etat.contexte.profil.objectifId).toBe("obj-1");
    expect(etat.contexte.profil.niveauEstime).not.toBeNull();
    expect(etat.contexte.modeleApprenant).not.toBeNull();
    expect(etat.contexte.modeleApprenant!.historiqueObservationIds.length).toBeGreaterThan(0);
    expect(etat.contexte.grapheCompetences).not.toBeNull();
    expect(etat.contexte.reponsesDiagnostic.length).toBeGreaterThanOrEqual(MIN_QUESTIONS);
    expect(etat.contexte.estimationNiveau?.evaluations.length).toBeGreaterThanOrEqual(
      MIN_QUESTIONS,
    );
  });

  it("rejette repondre en phase pret", async () => {
    const parcours = new OrchestrateurParcours(creerCapacitesMock());
    const etat = await menerDiagnosticComplet(parcours);
    expect(etat.phase).toBe("pret");

    await expect(parcours.repondre(etat, "trop tard")).rejects.toThrow(
      "repondre n'est disponible qu'en phase diagnostic",
    );
  });

  it("persiste objectif, profil, roadmap et niveau domaine au passage en phase pret", async () => {
    const capacites = creerCapacitesMock();
    const persistance = creerPersistanceMemoire();
    const parcours = new OrchestrateurParcours({ ...capacites, persistance });

    await menerDiagnosticComplet(parcours);

    const profil = await persistance.chargerProfil("obj-1");
    const roadmap = await persistance.chargerRoadmap("obj-1");
    const objectifs = await persistance.chargerObjectifs("japonais");
    const profilEleve = await persistance.chargerProfilEleve();
    expect(profil).not.toBeNull();
    expect(roadmap).not.toBeNull();
    expect(objectifs.some((o) => o.id === "obj-1")).toBe(true);
    expect(profilEleve?.niveauxParDomaine.japonais).toBeGreaterThan(0);
  });

  it("le contexte pret est accepté par OrchestrateurCycle", async () => {
    const capacites = creerCapacitesMock();
    const parcours = new OrchestrateurParcours(capacites);
    const etatParcours = await menerDiagnosticComplet(parcours);

    const cycle = new OrchestrateurCycle(capacites);
    const etatCycle = await cycle.demarrer(etatParcours.contexte);
    expect(etatCycle.etape).toBe("problematique");
    expect(etatCycle.contexte.roadmap).not.toBeNull();
  });
});
