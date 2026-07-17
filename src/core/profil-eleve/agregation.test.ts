import { describe, expect, it } from "vitest";
import { DOMAINES } from "@/app/_data/domaines";
import type { SessionPersistee } from "@/core/domain";
import { champsProfilEleveInitiaux } from "@/core/domain/profilEleve";
import { construireProfilEleve } from "@/core/profil-eleve/agregation";

const profilBase = {
  objectifId: "obj-1",
  acquis: ["bases"],
  competences: ["raisonnement"],
  lacunes: [{ sujet: "hiragana", description: "Lecture lente" }],
  erreursFrequentes: [],
  preferencesPedagogiques: ["exemples concrets"],
  notionsMaitrisees: ["salutations"],
  niveauEstime: 72,
  miseAJour: "2026-07-10T10:00:00.000Z",
};

const sessionJaponaisCycle: SessionPersistee = {
  objectif: {
    id: "obj-1",
    domaineId: "japonais",
    intitule: "JLPT N5",
    creeLe: "2026-01-01T00:00:00.000Z",
  },
  statut: "cycle",
  miseAJour: "2026-07-14T10:00:00.000Z",
  etatParcours: null,
  etatCycle: {
    contexte: {
      domaine: { id: "japonais", nom: "Japonais" },
      objectif: {
        id: "obj-1",
        domaineId: "japonais",
        intitule: "JLPT N5",
        creeLe: "2026-01-01T00:00:00.000Z",
      },
      profil: profilBase,
      roadmap: {
        objectifId: "obj-1",
        version: 1,
        notions: [
          {
            id: "n-1",
            titre: "Salutations",
            prerequisIds: [],
            objectifsPedagogiques: ["Saluer en japonais"],
            criteresDeMaitrise: [{ id: "c-1", description: "Saluer" }],
          },
          {
            id: "n-2",
            titre: "Hiragana",
            prerequisIds: ["n-1"],
            objectifsPedagogiques: ["Lire le hiragana"],
            criteresDeMaitrise: [{ id: "c-2", description: "Lire あいう" }],
          },
        ],
      },
      notionCouranteId: "n-1",
      reponsesDiagnostic: [],
      estimationNiveau: null,
    modeleApprenant: null,
    grapheCompetences: null,
    },
    etape: "cours",
    contenu: { type: "cours", cours: { notionId: "n-1", titre: "Salutations", blocs: [] } },
    etatExercices: null,
    termine: false,
  },
  archive: null,
};

const sessionJaponais: SessionPersistee = {
  objectif: {
    id: "obj-2",
    domaineId: "japonais",
    intitule: "Tenir une conversation simple",
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
        intitule: "Tenir une conversation simple",
        creeLe: "2026-02-01T00:00:00.000Z",
      },
      profil: {
        ...profilBase,
        objectifId: "obj-2",
        preferencesPedagogiques: ["répétition"],
        lacunes: [{ sujet: "particules", description: "は vs が" }],
        notionsMaitrisees: ["salutations"],
      },
      roadmap: {
        objectifId: "obj-2",
        version: 1,
        notions: [
          {
            id: "jn-1",
            titre: "Phrases du quotidien",
            prerequisIds: [],
            objectifsPedagogiques: ["Commander au konbini"],
            criteresDeMaitrise: [{ id: "jc-1", description: "Phrase simple" }],
          },
        ],
      },
      notionCouranteId: null,
      reponsesDiagnostic: [],
      estimationNiveau: null,
    modeleApprenant: null,
    grapheCompetences: null,
    },
    phase: "diagnostic",
    questionCourante: {
      id: "q-1",
      intitule: "Ton niveau ?",
      competenceId: "comp-1",
      competenceLibelle: "Niveau",
      difficulte: 3,
    },
    questionsPosees: 0,
    historiqueMaitrise: [],
  },
  etatCycle: null,
  archive: null,
};

describe("construireProfilEleve", () => {
  it("agrège les sessions par domaine avec champs IA vides par défaut", () => {
    const profil = construireProfilEleve(
      "user-1",
      "eleve@exemple.fr",
      [sessionJaponaisCycle, sessionJaponais],
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

    const japonais = profil.competencesParDomaine.find((c) => c.domaineId === "japonais");
    expect(japonais?.objectifsTotal).toBe(2);
    expect(japonais?.notionsMaitrisees).toBe(1);
    expect(japonais?.notionsTotal).toBe(2);
    expect(japonais?.lacunes).toHaveLength(2);
  });

  it("fusionne les champs persistés fournis par l'IA", () => {
    const profil = construireProfilEleve(
      "user-1",
      null,
      [sessionJaponaisCycle],
      {
        ...champsProfilEleveInitiaux(),
        typeMemoire: "visuelle",
        pointsForts: ["logique"],
        pointsFaibles: ["patience"],
        niveauxParDomaine: { japonais: 72 },
      },
      DOMAINES,
    );

    expect(profil.typeMemoire).toBe("visuelle");
    expect(profil.pointsForts).toEqual(["logique"]);
    expect(profil.pointsFaibles).toEqual(["patience"]);

    const japonais = profil.competencesParDomaine.find((c) => c.domaineId === "japonais");
    expect(japonais?.niveau).toBe(72);
  });
});
