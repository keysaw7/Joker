import { describe, expect, it } from "vitest";
import { FOURNISSEURS, grouperModelesParCategorie } from "./fournisseurs";

describe("fournisseurs", () => {
  it("groupe les modèles OpenAI par catégorie", () => {
    const openai = FOURNISSEURS.find((f) => f.id === "openai")!;
    const groupes = grouperModelesParCategorie(openai.modeles);

    expect(groupes.some((g) => g.categorie === "image")).toBe(true);
    expect(groupes.some((g) => g.categorie === "audio")).toBe(true);
    expect(groupes.some((g) => g.categorie === "transcription")).toBe(true);
    expect(groupes.some((g) => g.categorie === "code")).toBe(true);
  });

  it("groupe les modèles Google spécialisés", () => {
    const google = FOURNISSEURS.find((f) => f.id === "google")!;
    const groupes = grouperModelesParCategorie(google.modeles);
    const categories = groupes.map((g) => g.categorie);

    expect(categories).toContain("video");
    expect(categories).toContain("embedding");
    expect(categories).toContain("agent");
    expect(categories).toContain("open");
  });
});
