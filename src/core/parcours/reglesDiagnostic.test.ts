import { describe, expect, it } from "vitest";
import type {
  DifficulteDiagnostic,
  QuestionDiagnostic,
} from "@/core/domain";
import {
  diagnosticEstTermine,
  estimationInitiale,
  guidageInitialDepuisScore,
  mettreAJourEstimation,
  prochaineDifficulte,
  SEUIL_CONFIANCE,
} from "./reglesDiagnostic";

const question = (difficulte: DifficulteDiagnostic): QuestionDiagnostic => ({
  id: "q-1",
  intitule: "Question test",
  competenceId: "comp-1",
  competenceLibelle: "Compétence test",
  difficulte,
});

describe("reglesDiagnostic", () => {
  it("prochaineDifficulte ajuste selon la maîtrise", () => {
    expect(prochaineDifficulte(3, "maitrise")).toBe(4);
    expect(prochaineDifficulte(3, "partiel")).toBe(3);
    expect(prochaineDifficulte(3, "absent")).toBe(2);
    expect(prochaineDifficulte(5, "maitrise")).toBe(5);
    expect(prochaineDifficulte(1, "absent")).toBe(1);
  });

  it("mettreAJourEstimation calcule score et confiance", () => {
    let estimation = estimationInitiale();
    const historique: { difficulte: DifficulteDiagnostic; maitrise: "maitrise" }[] = [];

    for (let i = 0; i < 3; i++) {
      const q = question(4);
      const evalItem = {
        questionId: q.id,
        maitrise: "maitrise" as const,
        justification: "ok",
      };
      historique.push({ difficulte: 4, maitrise: "maitrise" });
      estimation = mettreAJourEstimation(estimation, q, evalItem, historique);
    }

    expect(estimation.scoreGlobal).toBeGreaterThan(0);
    expect(estimation.competences).toHaveLength(1);
    expect(estimation.confiance).toBeGreaterThan(0);
  });

  it("diagnosticEstTermine respecte min, max et plafond", () => {
    const estimation = { ...estimationInitiale(), confiance: SEUIL_CONFIANCE };
    expect(diagnosticEstTermine(2, estimation, [])).toBe(false);
    expect(diagnosticEstTermine(3, estimation, [])).toBe(true);
    expect(diagnosticEstTermine(8, estimation, [])).toBe(true);

    const historiquePlafond = [
      { difficulte: 4 as DifficulteDiagnostic, maitrise: "maitrise" as const },
      { difficulte: 5 as DifficulteDiagnostic, maitrise: "maitrise" as const },
    ];
    expect(
      diagnosticEstTermine(3, { ...estimationInitiale(), confiance: 0.2 }, historiquePlafond),
    ).toBe(true);
  });

  it("guidageInitialDepuisScore mappe le score", () => {
    expect(guidageInitialDepuisScore(30)).toBe("fort");
    expect(guidageInitialDepuisScore(50)).toBe("modere");
    expect(guidageInitialDepuisScore(80)).toBe("autonome");
  });
});
