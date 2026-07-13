import { describe, expect, it } from "vitest";
import { ajouterReponse, contexteInitial, profilInitial } from "./regles";

const domaine = { id: "maths", nom: "Mathématiques" };
const objectif = {
  id: "obj-1",
  domaineId: "maths",
  intitule: "Comprendre les dérivées",
  creeLe: "2026-01-01T00:00:00.000Z",
};

describe("regles parcours — logique pure", () => {
  it("profilInitial produit un profil vide cohérent", () => {
    const profil = profilInitial("obj-1");
    expect(profil.objectifId).toBe("obj-1");
    expect(profil.acquis).toEqual([]);
    expect(profil.notionsMaitrisees).toEqual([]);
    expect(profil.miseAJour).toBeTruthy();
  });

  it("contexteInitial produit un contexte de départ", () => {
    const contexte = contexteInitial(domaine, objectif);
    expect(contexte.domaine).toEqual(domaine);
    expect(contexte.objectif).toEqual(objectif);
    expect(contexte.roadmap).toBeNull();
    expect(contexte.notionCouranteId).toBeNull();
    expect(contexte.reponsesDiagnostic).toEqual([]);
    expect(contexte.profil.objectifId).toBe("obj-1");
  });

  it("ajouterReponse est immutable", () => {
    const contexte = contexteInitial(domaine, objectif);
    const reponse = { questionId: "q-1", reponse: "ma réponse" };
    const misAJour = ajouterReponse(contexte, reponse);
    expect(misAJour.reponsesDiagnostic).toHaveLength(1);
    expect(misAJour.reponsesDiagnostic[0]).toEqual(reponse);
    expect(contexte.reponsesDiagnostic).toHaveLength(0);
  });
});
