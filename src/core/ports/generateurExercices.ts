import type {
  ContexteApprentissage,
  Exercice,
  FormatExercice,
  NiveauGuidage,
  Notion,
} from "@/core/domain";

/** Crée des exercices adaptatifs selon le profil, le guidage et le format. */
export interface GenerateurExercices {
  genererExercice(
    contexte: ContexteApprentissage,
    notion: Notion,
    guidage: NiveauGuidage,
    format: FormatExercice,
  ): Promise<Exercice>;
}
