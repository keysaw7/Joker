import { describe, expect, it } from "vitest";
import type { Exercice } from "@/core/domain";
import {
  evaluerExercice,
  normaliserReponseTexte,
} from "./evaluateurExercice";

const qcm: Exercice = {
  id: "exo-qcm",
  notionId: "n1",
  format: "qcm",
  consigne: "Choisis",
  question: "Bonjour ?",
  options: ["こんにちは", "ありがとう", "さよなら"],
  bonneReponse: 0,
  guidage: "fort",
};

const trous: Exercice = {
  id: "exo-trous",
  notionId: "n1",
  format: "trous",
  consigne: "Complète",
  phrases: [
    {
      id: "p1",
      texteAvecTrous: "Merci se dit ___ .",
      solutions: ["arigatou", "ありがとう"],
    },
  ],
  guidage: "modere",
};

const appariement: Exercice = {
  id: "exo-app",
  notionId: "n1",
  format: "appariement",
  consigne: "Associe",
  paires: [
    { id: "a1", gauche: "bonjour", droite: "こんにちは" },
    { id: "a2", gauche: "merci", droite: "ありがとう" },
  ],
  guidage: "modere",
};

describe("evaluateurExercice", () => {
  it("normalise casse, accents et espaces", () => {
    expect(normaliserReponseTexte("  Konnichiwa  ")).toBe("konnichiwa");
    expect(normaliserReponseTexte("Été")).toBe("ete");
  });

  it("évalue un QCM correctement", () => {
    const ok = evaluerExercice(qcm, {
      exerciceId: qcm.id,
      format: "qcm",
      indexChoisi: 0,
    });
    expect(ok.analyse.correcte).toBe(true);
    expect(ok.items[0]?.correct).toBe(true);

    const ko = evaluerExercice(qcm, {
      exerciceId: qcm.id,
      format: "qcm",
      indexChoisi: 1,
    });
    expect(ko.analyse.correcte).toBe(false);
  });

  it("accepte les synonymes dans les trous", () => {
    const ok = evaluerExercice(trous, {
      exerciceId: trous.id,
      format: "trous",
      remplissages: { p1: ["  ARIGATOU "] },
    });
    expect(ok.analyse.correcte).toBe(true);

    const ok2 = evaluerExercice(trous, {
      exerciceId: trous.id,
      format: "trous",
      remplissages: { p1: ["ありがとう"] },
    });
    expect(ok2.analyse.correcte).toBe(true);

    const ko = evaluerExercice(trous, {
      exerciceId: trous.id,
      format: "trous",
      remplissages: { p1: ["bonjour"] },
    });
    expect(ko.analyse.correcte).toBe(false);
  });

  it("évalue un appariement", () => {
    const ok = evaluerExercice(appariement, {
      exerciceId: appariement.id,
      format: "appariement",
      associations: {
        a1: "こんにちは",
        a2: "ありがとう",
      },
    });
    expect(ok.analyse.correcte).toBe(true);
    expect(ok.items).toHaveLength(2);

    const ko = evaluerExercice(appariement, {
      exerciceId: appariement.id,
      format: "appariement",
      associations: {
        a1: "ありがとう",
        a2: "こんにちは",
      },
    });
    expect(ko.analyse.correcte).toBe(false);
  });

  it("refuse la production libre", () => {
    expect(() =>
      evaluerExercice(
        {
          id: "exo-pl",
          notionId: "n1",
          format: "production_libre",
          consigne: "Écris",
          enonce: "Présente-toi",
          guidage: "autonome",
        },
        {
          exerciceId: "exo-pl",
          format: "production_libre",
          contenu: "watashi wa…",
        },
      ),
    ).toThrow(/formats fermés/);
  });
});
