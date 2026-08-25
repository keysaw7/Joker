import { describe, expect, it } from "vitest";
import { estUrlSupabaseLocale } from "./estUrlSupabaseLocale";

describe("estUrlSupabaseLocale", () => {
  it("accepte 127.0.0.1 et localhost", () => {
    expect(estUrlSupabaseLocale("http://127.0.0.1:54321")).toBe(true);
    expect(estUrlSupabaseLocale("http://localhost:54321")).toBe(true);
  });

  it("refuse les URL distantes, vides ou invalides", () => {
    expect(estUrlSupabaseLocale("https://abc.supabase.co")).toBe(false);
    expect(estUrlSupabaseLocale(undefined)).toBe(false);
    expect(estUrlSupabaseLocale("")).toBe(false);
    expect(estUrlSupabaseLocale("pas-une-url")).toBe(false);
  });
});
