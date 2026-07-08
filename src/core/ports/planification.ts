import type { ContexteApprentissage, Roadmap } from "@/core/domain";

/**
 * Découpe l'objectif en une succession de notions ordonnées.
 * Première génération de la roadmap, après le diagnostic.
 */
export interface PlanificationPedagogique {
  genererRoadmap(contexte: ContexteApprentissage): Promise<Roadmap>;
}
