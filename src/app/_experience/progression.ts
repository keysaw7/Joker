import type { EtapeCycle, EtatCycle, Roadmap } from "@/core/domain";

export interface Progression {
  readonly total: number;
  /** Nombre de notions maîtrisées (IDs valides dans la roadmap uniquement). */
  readonly faites: number;
  /** Index 1-based de la notion courante (1 au démarrage). */
  readonly courante: number;
  readonly pourcentage: number;
}

/** Ne compte que les IDs qui existent vraiment dans la roadmap. */
export function notionsMaitriseesValides(
  notionsMaitrisees: readonly string[],
  roadmap: Roadmap | null | undefined,
): string[] {
  if (!roadmap) {
    return [];
  }
  const ids = new Set(roadmap.notions.map((n) => n.id));
  return notionsMaitrisees.filter((id) => ids.has(id));
}

export function indexNotionCourante(
  roadmap: Roadmap | null | undefined,
  notionCouranteId: string | null | undefined,
): number {
  if (!roadmap || !notionCouranteId) {
    return 0;
  }
  const index = roadmap.notions.findIndex((n) => n.id === notionCouranteId);
  return index >= 0 ? index + 1 : 0;
}

export function progression(etat: EtatCycle): Progression {
  const roadmap = etat.contexte.roadmap;
  const total = roadmap?.notions.length ?? 0;
  const faites = notionsMaitriseesValides(
    etat.contexte.profil.notionsMaitrisees,
    roadmap,
  ).length;
  const courante = indexNotionCourante(roadmap, etat.contexte.notionCouranteId);
  const pourcentage = total > 0 ? Math.round((faites / total) * 100) : 0;
  return { total, faites, courante, pourcentage };
}

const LIBELLES: Record<EtapeCycle, string> = {
  problematique: "Pourquoi apprendre",
  cours: "Cours",
  exempleExpert: "Exemple d'expert",
  exercices: "Exercices",
  recompense: "Récompense",
};

export const ORDRE_ETAPES: readonly EtapeCycle[] = [
  "problematique",
  "cours",
  "exempleExpert",
  "exercices",
  "recompense",
] as const;

export function libelleEtape(etape: EtapeCycle): string {
  return LIBELLES[etape];
}

export function etapeCycleVersSlug(etape: EtapeCycle): string {
  const slugs: Record<EtapeCycle, string> = {
    problematique: "probleme",
    cours: "cours",
    exempleExpert: "exemple",
    exercices: "exercices",
    recompense: "recompense",
  };
  return slugs[etape];
}
