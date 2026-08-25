import { describe, expect, it } from "vitest";
import { construireUtilisateurCourant } from "./utilisateur";

describe("construireUtilisateurCourant", () => {
  it("marque le mode local pour un utilisateur anonyme sur une URL locale", () => {
    expect(
      construireUtilisateurCourant(
        { id: "u1", email: null, is_anonymous: true },
        "http://127.0.0.1:54321",
      ),
    ).toEqual({
      id: "u1",
      email: null,
      modeLocal: true,
    });
  });

  it("ne marque pas le mode local pour un compte email, même en local", () => {
    expect(
      construireUtilisateurCourant(
        { id: "u2", email: "a@b.c", is_anonymous: false },
        "http://localhost:54321",
      ),
    ).toEqual({
      id: "u2",
      email: "a@b.c",
      modeLocal: false,
    });
  });

  it("ne marque pas le mode local sur une instance distante", () => {
    expect(
      construireUtilisateurCourant(
        { id: "u3", is_anonymous: true },
        "https://abc.supabase.co",
      ).modeLocal,
    ).toBe(false);
  });
});
