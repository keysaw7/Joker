import path from "node:path";
import { defineConfig } from "vitest/config";

// Les tests du cœur s'exécutent hors ligne : aucun appel réseau, aucun modèle d'IA réel.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
