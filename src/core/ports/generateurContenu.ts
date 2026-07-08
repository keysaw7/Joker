import type {
  ContexteApprentissage,
  Cours,
  ExempleExpert,
  Notion,
  Problematique,
} from "@/core/domain";

/**
 * Produit les contenus pédagogiques du Cycle :
 * problématique, cours, exemple d'expert.
 */
export interface GenerateurDeContenu {
  genererProblematique(
    contexte: ContexteApprentissage,
    notion: Notion,
  ): Promise<Problematique>;
  genererCours(
    contexte: ContexteApprentissage,
    notion: Notion,
  ): Promise<Cours>;
  genererExempleExpert(
    contexte: ContexteApprentissage,
    notion: Notion,
  ): Promise<ExempleExpert>;
}
