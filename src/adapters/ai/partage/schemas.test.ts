import { describe, expect, it } from "vitest";
import { normaliserAnalyse, normaliserBloc } from "./normaliser";
import {
  schemaAnalyseReponse,
  schemaBlocContenu,
  schemaCoursSansNotionId,
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
      connaissanceManquante: null,
      erreurCognitive: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepte un bloc de contenu avec legende nullable (schéma OpenAI)", () => {
    const result = schemaBlocContenu.safeParse({
      format: "texte",
      contenu: "Introduction",
      legende: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepte un cours avec blocs sans légende", () => {
    const result = schemaCoursSansNotionId.safeParse({
      titre: "Les bases",
      blocs: [{ format: "texte", contenu: "Contenu", legende: null }],
    });
    expect(result.success).toBe(true);
  });

  it("normalise null vers undefined pour le domaine", () => {
    const bloc = normaliserBloc({ format: "texte", contenu: "x", legende: null });
    expect(bloc.legende).toBeUndefined();

    const analyse = normaliserAnalyse({
      correcte: true,
      pourquoi: "ok",
      connaissanceManquante: null,
      confusion: null,
      erreurCognitive: null,
    });
    expect(analyse.connaissanceManquante).toBeUndefined();
  });
});
