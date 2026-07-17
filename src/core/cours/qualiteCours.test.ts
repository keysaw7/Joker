import { describe, expect, it } from "vitest";
import {
  choisirMeilleurPlan,
  evaluerQualitePlan,
} from "@/core/cours/qualiteCours";
import type { PlanCours } from "@/core/domain";

function planSyllabusPizza(): PlanCours {
  return {
    titre: "Plan de cours adaptable : hydratation pizza",
    intentions: [
      {
        type: "texte",
        markdown:
          "**Objectif :** maîtriser les quantités.\n**Public :** débutant.\n**Structure :** 10 blocs.",
      },
      {
        type: "texte",
        markdown:
          "- Fiche pratique 1 : Calcul des quantités\n- Fiche pratique 2 : Hydratation\n- Fiche pratique 3 : Repos",
      },
      { type: "texte", markdown: "Bloc 1 : Fondamentaux — comprendre les notions." },
      { type: "schema", briefMedia: "Processus pizza" },
      { type: "image", briefMedia: "Pizza", alt: "Pizza" },
    ],
  };
}

function planLeconDense(): PlanCours {
  const dense =
    "Pour 300 g de farine, une hydratation à 65 % correspond à 195 g d'eau. " +
    "Le sel représente environ 2 % du poids de farine, soit 6 g. " +
    "La levure sèche se situe souvent entre 1 et 1,5 % pour une fermentation courte. " +
    "Peser chaque ingrédient évite les approximations qui rendent la pâte difficile à étaler.";

  return {
    titre: "Hydratation et quantités pour deux portions",
    intentions: [
      { type: "texte", markdown: `## Introduction\n\n${dense}` },
      {
        type: "encadre",
        variante: "info",
        markdown: `${dense} Garde ces repères visibles pendant la préparation.`,
      },
      { type: "schema", briefMedia: "Flowchart pesée et hydratation" },
      { type: "image", briefMedia: "Plan de travail", alt: "Plan de travail" },
      {
        type: "etapes",
        etapes: [
          {
            titre: "Peser",
            markdown: `${dense} Commence toujours par la farine comme référence.`,
          },
        ],
      },
      {
        type: "quizFlash",
        question: "Hydratation typique ?",
        options: ["60–70 %", "90 %"],
        bonneReponse: 0,
        explication: "60–70 % est la plage standard.",
      },
    ],
  };
}

describe("qualiteCours", () => {
  it("rejette un syllabus type plan de cours / fiches vides", () => {
    const evaluation = evaluerQualitePlan(planSyllabusPizza());
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
    const meilleur = choisirMeilleurPlan(planSyllabusPizza(), planLeconDense());
    expect(meilleur.titre).toBe(planLeconDense().titre);
  });
});
