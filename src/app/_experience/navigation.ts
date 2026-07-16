import type { EtapeCycle, SessionPersistee } from "@/core/domain";
import { etapeCycleVersSlug, ORDRE_ETAPES } from "@/app/_experience/progression";

export type SlugEtape = "probleme" | "cours" | "exemple" | "exercices" | "recompense";

const SLUG_VERS_ETAPE: Record<SlugEtape, EtapeCycle> = {
  probleme: "problematique",
  cours: "cours",
  exemple: "exempleExpert",
  exercices: "exercices",
  recompense: "recompense",
};

export { ORDRE_ETAPES };

export function slugVersEtapeCycle(slug: string): EtapeCycle | null {
  return SLUG_VERS_ETAPE[slug as SlugEtape] ?? null;
}

export function urlEtape(
  objectifId: string,
  notionId: string,
  etape: EtapeCycle,
): string {
  return `/session/${objectifId}/notion/${notionId}/${etapeCycleVersSlug(etape)}`;
}

export function urlSession(objectifId: string): string {
  return `/session/${objectifId}`;
}

export function etapeSuivante(etape: EtapeCycle): EtapeCycle | null {
  const index = ORDRE_ETAPES.indexOf(etape);
  if (index < 0 || index >= ORDRE_ETAPES.length - 1) {
    return null;
  }
  return ORDRE_ETAPES[index + 1] ?? null;
}

export function cheminSessionCourant(session: SessionPersistee): string {
  const id = session.objectif.id;

  switch (session.statut) {
    case "diagnostic":
      return `/session/${id}/diagnostic`;
    case "generation":
      return `/session/${id}/generation`;
    case "termine":
      return `/session/${id}/bilan`;
    case "cycle": {
      const cycle = session.etatCycle;
      if (!cycle) {
        return `/session/${id}/generation`;
      }
      if (cycle.termine) {
        return `/session/${id}/bilan`;
      }
      const notionId = cycle.contexte.notionCouranteId;
      if (!notionId) {
        return `/session/${id}/generation`;
      }
      return urlEtape(id, notionId, cycle.etape);
    }
  }
}

export function estEtapeCourante(
  session: SessionPersistee,
  notionId: string,
  etape: EtapeCycle,
): boolean {
  if (session.statut !== "cycle" || !session.etatCycle) {
    return false;
  }
  const cycle = session.etatCycle;
  return (
    !cycle.termine &&
    cycle.contexte.notionCouranteId === notionId &&
    cycle.etape === etape
  );
}
