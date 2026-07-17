import { describe, expect, it } from "vitest";
import { etatGrapheVide, moyenneCroyance, varianceCroyance } from "@/core/domain";
import { creerPersistanceModeleMemoire } from "@/adapters/persistence/modeleApprentissageMemoire";
import {
  creerLearningModel,
  grapheDepuisRoadmap,
  guidageInitialDepuisModele,
  projeterEstimationDepuisModele,
  projeterProfilApprenant,
} from "./index";

const roadmap = {
  objectifId: "obj-1",
  version: 1,
  notions: [
    {
      id: "notion-a",
      titre: "Hiragana",
      prerequisIds: [],
      objectifsPedagogiques: ["Lire hiragana"],
      criteresDeMaitrise: [{ id: "c1", description: "Lire 46 kana" }],
    },
    {
      id: "notion-b",
      titre: "Katakana",
      prerequisIds: ["notion-a"],
      objectifsPedagogiques: ["Lire katakana"],
      criteresDeMaitrise: [{ id: "c2", description: "Lire 46 katakana" }],
    },
  ],
};

describe("Learning Model V0", () => {
  it("infère une croyance Beta après une réponse diagnostic", () => {
    const lm = creerLearningModel();
    let modele = lm.inference.initialiser("eleve-1");
    const graphe = etatGrapheVide("japonais");
    const grapheAvecNoeud = lm.graphe.ajouterNoeud(graphe, {
      id: "japonais:hiragana",
      type: "competence",
      libelle: "Hiragana",
      domaineId: "japonais",
    });

    const obs = lm.observation.depuisEvaluationDiagnostic(
      {
        id: "q1",
        intitule: "Lire あ",
        competenceId: "japonais:hiragana",
        competenceLibelle: "Hiragana",
        difficulte: 2,
      },
      {
        questionId: "q1",
        maitrise: "maitrise",
        justification: "ok",
      },
      {
        eleveId: "eleve-1",
        objectifId: "obj-1",
        noeudIds: ["japonais:hiragana"],
      },
    );

    modele = lm.inference.integrer(modele, obs, grapheAvecNoeud);
    const croyance = modele.croyances["japonais:hiragana"];
    expect(croyance).toBeDefined();
    expect(croyance!.nObservations).toBe(1);
    expect(moyenneCroyance(croyance!)).toBeGreaterThan(0.5);
    expect(varianceCroyance(croyance!)).toBeLessThan(varianceCroyance({
      noeudId: "x",
      alpha: 1,
      beta: 1,
      derniereMiseAJour: "",
      nObservations: 0,
    }));
  });

  it("propage légèrement vers les prérequis", () => {
    const lm = creerLearningModel();
    const graphe = grapheDepuisRoadmap(roadmap, "japonais");
    let modele = lm.inference.initialiser("eleve-1");

    const obs = lm.observation.depuisReponseExercice(
      {
        id: "ex1",
        notionId: "notion-b",
        format: "production_libre",
        consigne: "Lis",
        enonce: "Lis カ",
        guidage: "modere",
      },
      { correcte: true, pourquoi: "ok" },
      {
        eleveId: "eleve-1",
        objectifId: "obj-1",
        notionId: "notion-b",
        noeudIds: ["notion-b"],
      },
    );

    modele = lm.inference.integrerLot(modele, obs, graphe);
    expect(modele.croyances["notion-b"]).toBeDefined();
    expect(modele.croyances["notion-a"]).toBeDefined();
    expect(moyenneCroyance(modele.croyances["notion-a"]!)).toBeGreaterThan(0.5);
  });

  it("registre stabilise les IDs de compétences", () => {
    const lm = creerLearningModel();
    const a = lm.registre.resoudre("japonais", "Hiragana!!", "Hiragana");
    const b = lm.registre.resoudre("japonais", "hiragana", "Hiragana de base");
    expect(a.id).toBe(b.id);
    expect(a.cree).toBe(true);
    expect(b.cree).toBe(false);
  });

  it("graphe fusionne les prérequis depuis la roadmap", () => {
    const graphe = grapheDepuisRoadmap(roadmap, "japonais");
    expect(graphe.noeuds).toHaveLength(2);
    const lm = creerLearningModel();
    expect(lm.graphe.prerequis(graphe, "notion-b")).toEqual(["notion-a"]);
    expect(lm.graphe.chemin(graphe, "notion-a", "notion-b")).toEqual([
      "notion-a",
      "notion-b",
    ]);
  });

  it("projette ProfilApprenant et EstimationNiveau depuis le modèle", () => {
    const lm = creerLearningModel();
    let modele = lm.inference.initialiser("eleve-1");
    const graphe = grapheDepuisRoadmap(roadmap, "japonais");

    for (let i = 0; i < 5; i++) {
      const [obs] = lm.observation.depuisReponseExercice(
        {
          id: `ex-${i}`,
          notionId: "notion-a",
          format: "production_libre",
          consigne: "…",
          enonce: "…",
          guidage: "autonome",
        },
        { correcte: true, pourquoi: "ok" },
        {
          eleveId: "eleve-1",
          objectifId: "obj-1",
          notionId: "notion-a",
          noeudIds: ["notion-a"],
        },
      );
      modele = lm.inference.integrer(modele, obs!, graphe);
    }

    const profil = projeterProfilApprenant(modele, graphe, "obj-1", {
      objectifId: "obj-1",
      acquis: [],
      competences: [],
      lacunes: [],
      erreursFrequentes: [],
      preferencesPedagogiques: [],
      notionsMaitrisees: ["notion-a"],
      niveauEstime: null,
      miseAJour: new Date().toISOString(),
    });
    expect(profil.niveauEstime).toBeGreaterThan(50);
    expect(profil.acquis.length).toBeGreaterThan(0);
    expect(profil.notionsMaitrisees).toEqual(["notion-a"]);

    const estimation = projeterEstimationDepuisModele(modele, graphe);
    expect(estimation.competences.length).toBeGreaterThan(0);
    expect(estimation.confiance).toBeGreaterThan(0);
  });

  it("recommande une action de sondage en phase diagnostic", () => {
    const lm = creerLearningModel();
    const modele = lm.inference.initialiser("eleve-1");
    const graphe = grapheDepuisRoadmap(roadmap, "japonais");
    const action = lm.recommandation.recommander(modele, graphe, {
      phase: "diagnostic",
    });
    expect(action.type).toBe("sonder_competence");
  });

  it("prédit un gain attendu positif pour une notion fragile", () => {
    const lm = creerLearningModel();
    const modele = lm.inference.initialiser("eleve-1");
    const graphe = grapheDepuisRoadmap(roadmap, "japonais");
    const pred = lm.prediction.predire(
      modele,
      { type: "exercer", notionId: "notion-a", guidage: "fort" },
      graphe,
    );
    expect(pred.gainAttendu).toBeGreaterThanOrEqual(0);
    expect(pred.maitriseAttendueParNoeud["notion-a"]).toBeDefined();
  });

  it("guidageInitialDepuisModele dérive du niveau de croyance", () => {
    expect(guidageInitialDepuisModele(null, 80)).toBe("autonome");
    expect(guidageInitialDepuisModele(null, 50)).toBe("modere");
    expect(guidageInitialDepuisModele(null, 10)).toBe("fort");
  });

  it("persistance mémoire stocke modèle et observations", async () => {
    const store = creerPersistanceModeleMemoire();
    const lm = creerLearningModel();
    const modele = lm.inference.initialiser("eleve-1");
    await store.sauvegarderModele(modele);

    const obs = lm.observation.depuisSignalComportemental({
      type: "temps_reflexion",
      eleveId: "eleve-1",
      noeudIds: ["notion-a"],
      dureeMs: 12000,
    });
    await store.ajouterObservation(obs);

    expect(await store.chargerModele("eleve-1")).toEqual(modele);
    expect(await store.listerObservations("eleve-1")).toHaveLength(1);
  });

  it("incertitude diminue avec les observations", () => {
    const lm = creerLearningModel();
    let modele = lm.inference.initialiser("eleve-1");
    const graphe = grapheDepuisRoadmap(roadmap, "japonais");
    const avant = lm.incertitude.incertitudeGlobale(modele);

    for (let i = 0; i < 4; i++) {
      const [obs] = lm.observation.depuisReponseExercice(
        {
          id: `ex-${i}`,
          notionId: "notion-a",
          format: "qcm",
          consigne: "…",
          question: "…",
          options: ["A", "B"],
          bonneReponse: 0,
          guidage: "fort",
        },
        { correcte: i % 2 === 0, pourquoi: "…" },
        {
          eleveId: "eleve-1",
          objectifId: "obj-1",
          notionId: "notion-a",
          noeudIds: ["notion-a"],
        },
      );
      modele = lm.inference.integrer(modele, obs!, graphe);
    }

    const apres = lm.incertitude.incertitudeGlobale(modele);
    expect(apres).toBeLessThan(avant);
  });
});
