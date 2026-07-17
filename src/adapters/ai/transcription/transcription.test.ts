import { describe, expect, it } from "vitest";
import { creerTranscripteur, creerTranscripteurMock } from "@/adapters/ai/transcription";
import { fusionnerTexteSaisie } from "@/app/_composants/fusionnerTexteSaisie";

describe("fusionnerTexteSaisie", () => {
  it("ajoute la transcription après la valeur existante", () => {
    expect(fusionnerTexteSaisie("Bonjour", "monde")).toBe("Bonjour monde");
  });

  it("retourne la transcription seule si le champ est vide", () => {
    expect(fusionnerTexteSaisie("", "  texte  ")).toBe("texte");
  });

  it("ignore une transcription vide", () => {
    expect(fusionnerTexteSaisie("existant", "   ")).toBe("existant");
  });
});

describe("Transcripteur", () => {
  it("mock retourne un texte déterministe", async () => {
    const transcripteur = creerTranscripteurMock();
    const resultat = await transcripteur.transcrire({
      audio: new Uint8Array([1, 2, 3]),
      mediaType: "audio/webm",
    });
    expect(resultat.texte).toBe("[transcription mock]");
  });

  it("creerTranscripteur utilise le mock pour le fournisseur mock", async () => {
    const transcripteur = creerTranscripteur({
      fournisseur: "mock",
      modele: "mock",
    });
    const resultat = await transcripteur.transcrire({
      audio: new Uint8Array(0),
      mediaType: "audio/webm",
    });
    expect(resultat.texte).toContain("mock");
  });

  it("rejette un fournisseur non supporté", () => {
    expect(() =>
      creerTranscripteur({ fournisseur: "anthropic", modele: "claude-sonnet-5" }),
    ).toThrow("non supporté");
  });
});
