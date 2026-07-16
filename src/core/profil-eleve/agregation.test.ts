import { describe, expect, it } from "vitest";
import { DOMAINES } from "@/app/_data/domaines";
import type { SessionPersistee } from "@/core/domain";
import { champsProfilEleveInitiaux } from "@/core/domain/profilEleve";
import { construireProfilEleve } from "@/core/profil-eleve/agregation";

const profilBase = {
  objectifId: "obj-1",
  acquis: ["bases"],
  competences: ["raisonnement"],
  lacunes: [{ sujet: "fractions", description: "Confusion numérateur/dénominateur" }],
  erreursFrequentes: [],
  preferencesPedagogiques: ["exemples concrets"],
  notionsMaitrisees: ["derivation"],
  miseAJour: "2026-07-10T10:00:00.000Z",
};

const sessionMaths: SessionPersistee = {
  objectif: {
    id: "obj-1",
    domaineId: "maths",
    intitule: "Dérivées",
    creeLe: "2026-01-01T00:00:00.000Z",
  },
  statut: "cycle",
  miseAJour: "2026-07-14T10:00:00.000Z",
  etatParcours: null,
  etatCycle: {
    contexte: {
      domaine: { id: "maths", nom: "Mathématiques" },
      objectif: {
        id: "obj-1",
        domaineId: "maths",
        intitule: "Dérivées",
        creeLe: "2026-01-01T00:00:00.000Z",
      },
      profil: profilBase,
      roadmap: {
        objectifId: "obj-1",
        version: 1,
        notions: [
          {
            id: "n-1",
            titre: "Dérivation",
            prerequisIds: [],
            objectifsPedagogiques: ["Comprendre la dérivation"],
            criteresDeMaitrise: [{ id: "c-1", description: "Calculer une dérivée" }],
          },
          {
            id: "n-2",
            titre: "Intégrales",
            prerequisIds: ["n-1"],
            objectifsPedagogiques: ["Comprendre les intégrales"],
            criteresDeMaitrise: [{ id: "c-2", description: "Calculer une intégrale" }],
          },
        ],
      },
      notionCouranteId: "n-1",
      reponsesDiagnostic: [],
    },
    etape: "cours",
    contenu: { type: "cours", cours: { notionId: "n-1", titre: "Dérivation", blocs: [] } },
    etatExercices: null,
    termine: false,
  },
  archive: null,
};

const sessionJaponais: SessionPersistee = {
  objectif: {
    id: "obj-2",
    domaineId: "japonais",
    intitule: "JLPT N5",
    creeLe: "2026-02-01T00:00:00.000Z",
  },
  statut: "diagnostic",
  miseAJour: "2026-07-12T10:00:00.000Z",
  etatParcours: {
    contexte: {
      domaine: { id: "japonais", nom: "Japonais" },
      objectif: {
        id: "obj-2",
        domaineId: "japonais",
        intitule: "JLPT N5",
        creeLe: "2026-02-01T00:00:00.000Z",
      },
      profil: {
        ...profilBase,
        objectifId: "obj-2",
        preferencesPedagogiques: ["répétition"],
        lacunes: [{ sujet: "hiragana", description: "Lecture lente" }],
        notionsMaitrisees: ["salutations"],
      },
      roadmap: {
        objectifId: "obj-2",
        version: 1,
        notions: [
          {
            id: "jn-1",
            titre: "Salutations",
            prerequisIds: [],
            objectifsPedagogiques: ["Saluer en japonais"],
            criteresDeMaitrise: [{ id: "jc-1", description: "Saluer" }],
          },
        ],
      },
      notionCouranteId: null,
      reponsesDiagnostic: [],
    },
    phase: "diagnostic",
    questions: [{ id: "q-1", intitule: "Ton niveau ?" }],
  },
  etatCycle: null,
  archive: null,
};

describe("construireProfilEleve", () => {
  it("agrège les sessions par domaine avec champs IA vides par défaut", () => {
    const profil = construireProfilEleve(
      "user-1",
      "eleve@exemple.fr",
      [sessionMaths, sessionJaponais],
      null,
      DOMAINES,
    );

    expect(profil.utilisateurId).toBe("user-1");
    expect(profil.email).toBe("eleve@exemple.fr");
    expect(profil.typeMemoire).toBeNull();
    expect(profil.pointsForts).toEqual([]);
    expect(profil.pointsFaibles).toEqual([]);
    expect(profil.preferencesPedagogiques).toEqual(["exemples concrets", "répétition"]);
    expect(profil.miseAJour).toBe("2026-07-14T10:00:00.000Z");

    const maths = profil.competencesParDomaine.find((c) => c.domaineId === "maths");
    expect(maths?.objectifsTotal).toBe(1);
    expect(maths?.notionsMaitrisees).toBe(1);
    expect(maths?.notionsTotal).toBe(2);
    expect(maths?.lacunes).toHaveLength(1);

    const japonais = profil.competencesParDomaine.find((c) => c.domaineId === "japonais");
    expect(japonais?.objectifsTotal).toBe(1);
    expect(japonais?.notionsMaitrisees).toBe(1);
  });

  it("fusionne les champs persistés fournis par l'IA", () => {
    const profil = construireProfilEleve(
      "user-1",
      null,
      [sessionMaths],
      {
        ...champsProfilEleveInitiaux(),
        typeMemoire: "visuelle",
        pointsForts: ["logique"],
        pointsFaibles: ["patience"],
        niveauxParDomaine: { maths: 72 },
      },
      DOMAINES,
    );

    expect(profil.typeMemoire).toBe("visuelle");
    expect(profil.pointsForts).toEqual(["logique"]);
    expect(profil.pointsFaibles).toEqual(["patience"]);

    const maths = profil.competencesParDomaine.find((c) => c.domaineId === "maths");
    expect(maths?.niveau).toBe(72);
  });
});
