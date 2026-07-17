import { describe, expect, it } from "vitest";
import {
  choisirMeilleurPlan,
  evaluerQualitePlan,
} from "@/core/cours/qualiteCours";
import type { PlanCours } from "@/core/domain";

function planSyllabusJaponais(): PlanCours {
  return {
    titre: "Plan de cours adaptable : salutations JLPT N5",
    intentions: [
      {
        type: "texte",
        markdown:
          "**Objectif :** maîtriser les formules de base.\n**Public :** débutant.\n**Structure :** 10 blocs.",
      },
      {
        type: "texte",
        markdown:
          "- Fiche pratique 1 : こんにちは et registre\n- Fiche pratique 2 : Présentation\n- Fiche pratique 3 : Politesse",
      },
      { type: "texte", markdown: "Bloc 1 : Fondamentaux — comprendre les notions." },
      { type: "schema", briefMedia: "Processus salutation" },
      { type: "image", briefMedia: "Scène konbini", alt: "Konbini" },
    ],
  };
}

function planLeconDense(): PlanCours {
  const dense =
    "**こんにちは** sert le jour ; **こんばんは** le soir. " +
    "Le matin poli : **おはようございます**. Pour te présenter : **はじめまして** puis **よろしくお願いします**. " +
    "Répéter à voix haute fixe la prononciation et le rythme des formules. " +
    "Noter romaji + sens en français sur une fiche évite les confusions au konbini ou en cours.";

  return {
    titre: "Salutations et présentation pour le JLPT N5",
    intentions: [
      { type: "texte", markdown: `## Introduction\n\n${dense}` },
      {
        type: "encadre",
        variante: "info",
        markdown: `${dense} Garde ces formules visibles pendant la répétition.`,
      },
      { type: "schema", briefMedia: "Flowchart salutation selon l'heure" },
      { type: "image", briefMedia: "Rue au Japon", alt: "Salutations" },
      {
        type: "etapes",
        etapes: [
          {
            titre: "Répéter",
            markdown: `${dense} Commence par trois salutations selon l'heure.`,
          },
        ],
      },
      {
        type: "quizFlash",
        question: "Salutation en milieu de journée ?",
        options: ["おはよう", "こんにちは"],
        bonneReponse: 1,
        explication: "こんにちは est la formule standard.",
      },
    ],
  };
}

describe("qualiteCours", () => {
  it("rejette un syllabus type plan de cours / fiches vides", () => {
    const evaluation = evaluerQualitePlan(planSyllabusJaponais());
    expect(evaluation.valide).toBe(false);
    expect(evaluation.defauts.some((d) => d.includes("plan"))).toBe(true);
    expect(evaluation.defauts.some((d) => d.includes("Fiches pratiques"))).toBe(true);
  });

  it("accepte une leçon dense avec quiz final et médias", () => {
    const evaluation = evaluerQualitePlan(planLeconDense());
    expect(evaluation.valide).toBe(true);
    expect(evaluation.defauts).toHaveLength(0);
  });

  it("choisit le plan le plus riche entre deux brouillons", () => {
    const meilleur = choisirMeilleurPlan(planSyllabusJaponais(), planLeconDense());
    expect(meilleur.titre).toBe(planLeconDense().titre);
  });
});
