import type {
  BlocContenu,
  ContexteApprentissage,
  Cours,
  IntentionBloc,
  Notion,
  PlanCours,
} from "@/core/domain";

/**
 * Orchestre la composition d'un cours riche :
 * plan textuel → enrichissement parallèle par format → assemblage.
 */
export interface ConcepteurDeCours {
  composerCours(contexte: ContexteApprentissage, notion: Notion): Promise<Cours>;
  /** Enrichit des intentions (schéma, graphique, image…) en blocs affichables. */
  enrichirIntentions(
    contexte: ContexteApprentissage,
    notion: Notion,
    intentions: readonly IntentionBloc[],
  ): Promise<BlocContenu[]>;
}

/**
 * Produit le plan de cours (intentions de blocs) avant enrichissement média.
 */
export interface PlanificateurCours {
  genererPlanCours(
    contexte: ContexteApprentissage,
    notion: Notion,
  ): Promise<PlanCours>;
}
