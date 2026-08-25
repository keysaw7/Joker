import { describe, expect, it } from "vitest";
import { normaliserAnalyse, normaliserExercice, normaliserIntention } from "./normaliser";
import {
  schemaAnalyseReponse,
  schemaExempleExpertSansNotionId,
  schemaExercicePourFormat,
  schemaPlanCours,
  schemaProfilSansIds,
  schemaQuestionsDiagnostic,
  schemaRoadmapSansIds,
  schemaSpecGraphique,
} from "./schemas";

describe("schemas IA", () => {
  it("accepte 5 questions de diagnostic valides", () => {
    const result = schemaQuestionsDiagnostic.safeParse({
      questions: [
        { intitule: "Quel est votre niveau en japonais ?" },
        { intitule: "Savez-vous lire le hiragana ?" },
        { intitule: "Comment vous présentez-vous en japonais ?" },
        { intitule: "Expliquez la différence entre です et だ." },
        { intitule: "Comment commanderiez-vous au konbini ?" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepte un profil sans identifiants", () => {
    const result = schemaProfilSansIds.safeParse({
      acquis: ["arithmétique"],
      competences: ["calcul mental"],
      lacunes: [{ sujet: "particules", description: "confusion は / が" }],
      erreursFrequentes: ["inversion des termes"],
      preferencesPedagogiques: ["exemples concrets"],
      notionsMaitrisees: [],
    });
    expect(result.success).toBe(true);
  });

  it("accepte une roadmap avec prérequis par indices", () => {
    const result = schemaRoadmapSansIds.safeParse({
      notions: [
        {
          titre: "Les bases",
          prerequisOrdres: [],
          objectifsPedagogiques: ["Comprendre les fondements"],
          criteresDeMaitrise: [{ description: "Répondre à un exercice simple" }],
          maitriseInitiale: false,
        },
        {
          titre: "Approfondissement",
          prerequisOrdres: [0],
          objectifsPedagogiques: ["Aller plus loin"],
          criteresDeMaitrise: [{ description: "Réussir un exercice autonome" }],
          maitriseInitiale: false,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepte une analyse de réponse", () => {
    const result = schemaAnalyseReponse.safeParse({
      correcte: false,
      pourquoi: "Confusion entre numérateur et dénominateur",
      confusion: "inversion des termes",
      connaissanceManquante: null,
      erreurCognitive: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepte un plan de cours avec intentions variées", () => {
    const result = schemaPlanCours.safeParse({
      titre: "Les bases",
      intentions: [
        {
          type: "texte",
          markdown: "Introduction",
          variante: null,
          titre: null,
          source: null,
          cible: null,
          explication: null,
          entetes: null,
          lignes: null,
          legende: null,
          briefMedia: null,
          alt: null,
          etapes: null,
          question: null,
          options: null,
          bonneReponse: null,
        },
        {
          type: "encadre",
          variante: "astuce",
          markdown: "Conseil",
          titre: null,
          source: null,
          cible: null,
          explication: null,
          entetes: null,
          lignes: null,
          legende: null,
          briefMedia: null,
          alt: null,
          etapes: null,
          question: null,
          options: null,
          bonneReponse: null,
        },
        {
          type: "schema",
          briefMedia: "Schéma du processus",
          legende: null,
          markdown: null,
          variante: null,
          titre: null,
          source: null,
          cible: null,
          explication: null,
          entetes: null,
          lignes: null,
          alt: null,
          etapes: null,
          question: null,
          options: null,
          bonneReponse: null,
        },
        {
          type: "quizFlash",
          question: "Question ?",
          options: ["A", "B"],
          bonneReponse: 0,
          explication: "Parce que A.",
          markdown: null,
          variante: null,
          titre: null,
          source: null,
          cible: null,
          entetes: null,
          lignes: null,
          legende: null,
          briefMedia: null,
          alt: null,
          etapes: null,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepte une spécification de graphique", () => {
    const result = schemaSpecGraphique.safeParse({
      genre: "barres",
      titre: "Progression",
      axeX: "Étape",
      series: [
        {
          nom: "Score",
          points: [
            { etiquette: "Début", valeur: 10 },
            { etiquette: "Fin", valeur: 80 },
          ],
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("dégrade un quizFlash incomplet avec explication par défaut", () => {
    const intention = normaliserIntention({
      type: "quizFlash",
      question: "Quelle est la bonne réponse ?",
      options: ["A", "B", "C"],
      bonneReponse: 1,
      explication: null,
      markdown: null,
      variante: null,
      titre: null,
      source: null,
      cible: null,
      entetes: null,
      lignes: null,
      legende: null,
      briefMedia: null,
      alt: null,
      etapes: null,
    });
    expect(intention.type).toBe("quizFlash");
    if (intention.type === "quizFlash") {
      expect(intention.explication).toContain("Revois ce point");
    }
  });

  it("normalise les intentions nullable vers undefined", () => {
    const intention = normaliserIntention({
      type: "tableau",
      entetes: ["A", "B"],
      lignes: [["1", "2"]],
      legende: null,
      markdown: null,
      variante: null,
      titre: null,
      source: null,
      cible: null,
      explication: null,
      briefMedia: null,
      alt: null,
      etapes: null,
      question: null,
      options: null,
      bonneReponse: null,
    });
    expect(intention.type).toBe("tableau");
    if (intention.type === "tableau") {
      expect(intention.legende).toBeUndefined();
    }

    const analyse = normaliserAnalyse({
      correcte: true,
      pourquoi: "ok",
      connaissanceManquante: null,
      confusion: null,
      erreurCognitive: null,
    });
    expect(analyse.connaissanceManquante).toBeUndefined();
  });

  const champsNulsIntention = {
    variante: null,
    titre: null,
    source: null,
    cible: null,
    explication: null,
    entetes: null,
    lignes: null,
    legende: null,
    briefMedia: null,
    alt: null,
    etapes: null,
    question: null,
    options: null,
    bonneReponse: null,
  };

  it("accepte un exemple d'expert valide (types restreints)", () => {
    const result = schemaExempleExpertSansNotionId.safeParse({
      contexte: "Un étudiant prépare le JLPT N5 avant un échange au Japon.",
      intentions: [
        {
          type: "texte",
          markdown: "Il doit saluer son hôte malgré le jet lag du matin.",
          ...champsNulsIntention,
        },
        {
          type: "encadre",
          variante: "exemple",
          markdown: "L'expert choisit おはようございます plutôt qu'un simple おはよう.",
          titre: "Geste expert",
          source: null,
          cible: null,
          explication: null,
          entetes: null,
          lignes: null,
          legende: null,
          briefMedia: null,
          alt: null,
          etapes: null,
          question: null,
          options: null,
          bonneReponse: null,
        },
        {
          type: "analogie",
          source: "choisir bonjour ou bonsoir en français",
          cible: "le registre en japonais",
          explication: "Comme en français, le moment et la politesse guident la formule.",
          markdown: null,
          variante: null,
          titre: null,
          entetes: null,
          lignes: null,
          legende: null,
          briefMedia: null,
          alt: null,
          etapes: null,
          question: null,
          options: null,
          bonneReponse: null,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejette quizFlash dans un exemple d'expert", () => {
    const result = schemaExempleExpertSansNotionId.safeParse({
      contexte: "Situation réelle.",
      intentions: [
        {
          type: "texte",
          markdown: "Intro",
          ...champsNulsIntention,
        },
        {
          type: "encadre",
          ...champsNulsIntention,
          variante: "info",
          markdown: "Détail",
        },
        {
          type: "quizFlash",
          question: "Q ?",
          options: ["A", "B"],
          bonneReponse: 0,
          explication: "A.",
          markdown: null,
          variante: null,
          titre: null,
          source: null,
          cible: null,
          entetes: null,
          lignes: null,
          legende: null,
          briefMedia: null,
          alt: null,
          etapes: null,
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejette etapes et graphique dans un exemple d'expert", () => {
    const base = {
      contexte: "Situation réelle.",
      intentions: [
        {
          type: "texte",
          markdown: "Intro",
          ...champsNulsIntention,
        },
        {
          type: "encadre",
          ...champsNulsIntention,
          variante: "info",
          markdown: "Détail",
        },
      ],
    };

    expect(
      schemaExempleExpertSansNotionId.safeParse({
        ...base,
        intentions: [
          ...base.intentions,
          {
            type: "etapes",
            etapes: [{ titre: "Étape 1", markdown: "Faire ceci." }],
            markdown: null,
            variante: null,
            titre: null,
            source: null,
            cible: null,
            explication: null,
            entetes: null,
            lignes: null,
            legende: null,
            briefMedia: null,
            alt: null,
            question: null,
            options: null,
            bonneReponse: null,
          },
        ],
      }).success,
    ).toBe(false);

    expect(
      schemaExempleExpertSansNotionId.safeParse({
        ...base,
        intentions: [
          ...base.intentions,
          {
            type: "graphique",
            briefMedia: "Graphique didactique",
            markdown: null,
            variante: null,
            titre: null,
            source: null,
            cible: null,
            explication: null,
            entetes: null,
            lignes: null,
            legende: null,
            alt: null,
            etapes: null,
            question: null,
            options: null,
            bonneReponse: null,
          },
        ],
      }).success,
    ).toBe(false);
  });

  it("rejette un QCM incomplet au schéma du format", () => {
    const schema = schemaExercicePourFormat("qcm");
    expect(
      schema.safeParse({
        format: "qcm",
        consigne: "Choisis la bonne réponse",
        guidage: "fort",
        cibleLacune: "particules",
        question: null,
        options: null,
        bonneReponse: null,
      }).success,
    ).toBe(false);
    expect(
      schema.safeParse({
        format: "qcm",
        consigne: "Choisis la bonne réponse",
        guidage: "fort",
        cibleLacune: "particules",
        question: "Quelle particule ?",
        options: ["は"],
        bonneReponse: 0,
      }).success,
    ).toBe(false);
  });

  it("accepte un QCM complet et le normalise", () => {
    const genere = schemaExercicePourFormat("qcm").parse({
      format: "qcm",
      consigne: "Choisis la bonne réponse",
      guidage: "fort",
      cibleLacune: "particules",
      question: "Quelle particule marque le thème ?",
      options: ["は", "が", "を"],
      bonneReponse: 0,
    });
    const exercice = normaliserExercice(genere, {
      id: "ex-1",
      notionId: "n-1",
    });
    expect(exercice).toMatchObject({
      format: "qcm",
      question: "Quelle particule marque le thème ?",
      options: ["は", "が", "を"],
      bonneReponse: 0,
      cibleLacune: "particules",
    });
  });

  it("lève si un QCM normalisé n'a plus assez d'options après nettoyage", () => {
    expect(() =>
      normaliserExercice(
        {
          format: "qcm",
          consigne: "Choisis",
          guidage: "fort",
          question: "Question ?",
          options: ["A", "  "],
          bonneReponse: 0,
        },
        { id: "ex-1", notionId: "n-1" },
      ),
    ).toThrow(/QCM incomplet/);
  });
});
