import type { FragmentConnaissance } from "@/core/domain";
import type { SourceDeConnaissances } from "@/core/ports";

/** Fallback sans Bible : aucune connaissance validée n'est disponible. */
export function creerSourceFallback(): SourceDeConnaissances {
  return {
    async estDisponible(): Promise<boolean> {
      return false;
    },
    async rechercher(): Promise<readonly FragmentConnaissance[]> {
      return [];
    },
  };
}
