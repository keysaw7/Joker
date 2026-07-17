import type { NoeudConnaissance } from "@/core/domain";

export interface CompetenceResolue {
  readonly id: string;
  readonly libelle: string;
  readonly cree: boolean;
}

/**
 * Garantit des IDs de compétences stables.
 * L'IA peut proposer un id/libellé ; le registre résout vers un nœud canonique.
 */
export interface RegistreCompetences {
  resoudre(
    domaineId: string,
    competenceIdPropose: string,
    libelle: string,
  ): CompetenceResolue;

  obtenir(domaineId: string, competenceId: string): NoeudConnaissance | null;

  lister(domaineId: string): readonly NoeudConnaissance[];
}
