import { describe, expect, it, vi } from "vitest";
import type { IntentionBloc, Notion } from "@/core/domain";
import {
  assurerIntentionsExempleExpert,
  estIntentionExempleExpertPermise,
  filtrerIntentionsExempleExpert,
  intentionsExempleExpertFallback,
} from "./filtrerIntentionsExempleExpert";

const notion: Notion = {
  id: "notion-1",
  titre: "Salutations",
  prerequisIds: [],
  objectifsPedagogiques: ["Saluer en japonais"],
  criteresDeMaitrise: [{ id: "c1", description: "Saluer correctement" }],
};

const intentionTexte: IntentionBloc = {
  type: "texte",
  markdown: "Situation réelle.",
};

const intentionQuiz: IntentionBloc = {
  type: "quizFlash",
  question: "Q ?",
  options: ["A", "B"],
  bonneReponse: 0,
  explication: "A.",
};

const intentionEtapes: IntentionBloc = {
  type: "etapes",
  etapes: [{ titre: "Étape 1", markdown: "Faire ceci." }],
};

const intentionGraphique: IntentionBloc = {
  type: "graphique",
  briefMedia: "Tableau hiragana de base",
};

describe("filtrerIntentionsExempleExpert", () => {
  it("autorise texte, encadre, analogie et image", () => {
    expect(estIntentionExempleExpertPermise(intentionTexte)).toBe(true);
    expect(
      estIntentionExempleExpertPermise({
        type: "encadre",
        variante: "exemple",
        markdown: "Geste expert.",
      }),
    ).toBe(true);
    expect(
      estIntentionExempleExpertPermise({
        type: "analogie",
        source: "GPS",
        cible: "ajustement",
        explication: "Comme un GPS.",
      }),
    ).toBe(true);
    expect(
      estIntentionExempleExpertPermise({
        type: "image",
        briefMedia: "Scène de rue au Japon",
        alt: "Deux personnes se saluent",
      }),
    ).toBe(true);
  });

  it("rejette quizFlash, etapes et graphique", () => {
    expect(estIntentionExempleExpertPermise(intentionQuiz)).toBe(false);
    expect(estIntentionExempleExpertPermise(intentionEtapes)).toBe(false);
    expect(estIntentionExempleExpertPermise(intentionGraphique)).toBe(false);
  });

  it("filtre les intentions interdites et journalise les rejets", () => {
    const onRejet = vi.fn();
    const resultat = filtrerIntentionsExempleExpert(
      [intentionTexte, intentionQuiz, intentionEtapes],
      { onRejet },
    );
    expect(resultat).toEqual([intentionTexte]);
    expect(onRejet).toHaveBeenCalledTimes(2);
  });

  it("retourne un fallback minimal si toutes les intentions sont rejetées", () => {
    const resultat = assurerIntentionsExempleExpert(
      [intentionQuiz, intentionGraphique],
      notion,
    );
    expect(resultat).toEqual(intentionsExempleExpertFallback(notion));
  });
});
