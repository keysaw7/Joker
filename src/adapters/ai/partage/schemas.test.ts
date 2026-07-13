import { describe, expect, it } from "vitest";
import {
  schemaAnalyseReponse,
  schemaProfilSansIds,
  schemaQuestionDiagnostic,
  schemaRoadmapSansIds,
} from "./schemas";

describe("schemas IA", () => {
  it("accepte une question de diagnostic valide", () => {
    const result = schemaQuestionDiagnostic.safeParse({
      intitule: "Quel est votre niveau en algèbre ?",
    });
    expect(result.success).toBe(true);
  });

  it("accepte un profil sans identifiants", () => {
    const result = schemaProfilSansIds.safeParse({
      acquis: ["arithmétique"],
      competences: ["calcul mental"],
      lacunes: [{ sujet: "fractions", description: "manque de pratique" }],
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
        },
        {
          titre: "Approfondissement",
          prerequisOrdres: [0],
          objectifsPedagogiques: ["Aller plus loin"],
          criteresDeMaitrise: [{ description: "Réussir un exercice autonome" }],
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
    });
    expect(result.success).toBe(true);
  });
});
