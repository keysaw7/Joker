import type {
  ContexteApprentissage,
  Exercice,
  NiveauGuidage,
  Notion,
} from "@/core/domain";

/** Crée des exercices adaptatifs selon le profil et le niveau de guidage. */
export interface GenerateurExercices {
  genererExercice(
    contexte: ContexteApprentissage,
    notion: Notion,
    guidage: NiveauGuidage,
  ): Promise<Exercice>;
}
