import type { EtapeCycle, EtatCycle } from "@/core/domain";

export interface Progression {
  readonly total: number;
  readonly faites: number;
  readonly pourcentage: number;
}

export function progression(etat: EtatCycle): Progression {
  const total = etat.contexte.roadmap?.notions.length ?? 0;
  const faites = etat.contexte.profil.notionsMaitrisees.length;
  const pourcentage = total > 0 ? Math.round((faites / total) * 100) : 0;
  return { total, faites, pourcentage };
}

const LIBELLES: Record<EtapeCycle, string> = {
  problematique: "Pourquoi apprendre",
  cours: "Cours",
  exempleExpert: "Exemple d'expert",
  exercices: "Exercices",
  recompense: "Récompense",
};

export function libelleEtape(etape: EtapeCycle): string {
  return LIBELLES[etape];
}
