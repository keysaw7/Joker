import { describe, expect, it } from "vitest";
import { sanitiserJsonPourPostgres } from "./sanitiserJson";

describe("sanitiserJsonPourPostgres", () => {
  it("retire les NUL des chaînes", () => {
    expect(sanitiserJsonPourPostgres("a\u0000b")).toBe("ab");
  });

  it("sanitize récursivement objets et tableaux", () => {
    const entree = {
      titre: "ok\u0000",
      blocs: [{ markdown: "x\u0000y" }, "z\u0000"],
      n: 1,
      b: true,
      vide: null,
    };
    expect(sanitiserJsonPourPostgres(entree)).toEqual({
      titre: "ok",
      blocs: [{ markdown: "xy" }, "z"],
      n: 1,
      b: true,
      vide: null,
    });
  });
});
