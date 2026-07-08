import type { FragmentConnaissance } from "@/core/domain";

/**
 * Source de connaissances validées (Bible du domaine).
 * Branchable : le moteur fonctionne aussi sans Bible (fallback).
 */
export interface SourceDeConnaissances {
  estDisponible(domaineId: string): Promise<boolean>;
  rechercher(
    domaineId: string,
    requete: string,
  ): Promise<readonly FragmentConnaissance[]>;
}
