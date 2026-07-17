import { describe, expect, it } from "vitest";
import { fusionnerTexteSaisie } from "./fusionnerTexteSaisie";

describe("dictée temps réel — fusion progressive", () => {
  it("affiche prefixe + finals + interim comme une seule saisie", () => {
    const prefixe = "Objectif :";
    const finals = "apprendre le japonais";
    const interim = "couramment";
    const dictée = [finals, interim].filter(Boolean).join(" ");
    expect(fusionnerTexteSaisie(prefixe, dictée)).toBe(
      "Objectif : apprendre le japonais couramment",
    );
  });
});
