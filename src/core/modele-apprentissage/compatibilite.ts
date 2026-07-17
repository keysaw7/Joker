import type { ContexteApprentissage } from "@/core/domain";
import { modeleApprenantInitial } from "@/core/domain";

/**
 * Garantit les champs Learning Model sur les contextes legacy (sessions JSON anciennes).
 */
export function normaliserContexteApprentissage(
  contexte: ContexteApprentissage,
): ContexteApprentissage {
  const partiel = contexte as ContexteApprentissage & {
    modeleApprenant?: ContexteApprentissage["modeleApprenant"];
    grapheCompetences?: ContexteApprentissage["grapheCompetences"];
  };

  return {
    ...contexte,
    modeleApprenant:
      partiel.modeleApprenant !== undefined
        ? partiel.modeleApprenant
        : modeleApprenantInitial(contexte.objectif.id),
    grapheCompetences:
      partiel.grapheCompetences !== undefined
        ? partiel.grapheCompetences
        : null,
  };
}
