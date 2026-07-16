"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  avancerCycle,
  notionSuivante,
  repondreExercice,
} from "@/app/actions";
import {
  etapeSuivante,
  urlEtape,
  urlSession,
} from "@/app/_experience/navigation";
import type { EtapeCycle } from "@/core/domain";
import { Bouton } from "../Bouton";

interface BarreActionsCycleProps {
  objectifId: string;
  estCourante: boolean;
  termine?: boolean;
  typeContenu: "problematique" | "cours" | "exempleExpert" | "exercice" | "recompense";
}

export function BarreActionsCycle({
  objectifId,
  estCourante,
  termine = false,
  typeContenu,
}: BarreActionsCycleProps) {
  const router = useRouter();
  const [enCours, startTransition] = useTransition();

  if (!estCourante) {
    return null;
  }

  function naviguerVers(resultat: {
    notionId: string;
    etape: EtapeCycle;
    termine: boolean;
  }) {
    if (resultat.termine) {
      router.push(`${urlSession(objectifId)}/bilan`);
      router.refresh();
      return;
    }
    router.push(urlEtape(objectifId, resultat.notionId, resultat.etape));
    // Rafraîchit le layout (sidebar) qui n'est pas re-fetché lors d'une
    // navigation entre segments frères.
    router.refresh();
  }

  if (
    typeContenu === "problematique" ||
    typeContenu === "cours" ||
    typeContenu === "exempleExpert"
  ) {
    return (
      <div className="mt-8 flex gap-3">
        <Bouton
          enCours={enCours}
          onClick={() => {
            startTransition(async () => {
              const resultat = await avancerCycle(objectifId);
              naviguerVers(resultat);
            });
          }}
        >
          Continuer
        </Bouton>
      </div>
    );
  }

  if (typeContenu === "recompense" && !termine) {
    return (
      <div className="mt-8 flex gap-3">
        <Bouton
          enCours={enCours}
          onClick={() => {
            startTransition(async () => {
              const resultat = await notionSuivante(objectifId);
              naviguerVers(resultat);
            });
          }}
        >
          Notion suivante
        </Bouton>
      </div>
    );
  }

  return null;
}

interface BarreActionsExerciceProps {
  objectifId: string;
  estCourante: boolean;
}

export function useActionsExercice({ objectifId, estCourante }: BarreActionsExerciceProps) {
  const router = useRouter();
  const [enCours, startTransition] = useTransition();

  function repondre(texte: string) {
    if (!estCourante) {
      return;
    }
    startTransition(async () => {
      const resultat = await repondreExercice(objectifId, texte);
      router.push(urlEtape(objectifId, resultat.notionId, resultat.etape));
      router.refresh();
    });
  }

  return { repondre, enCours };
}

export function libelleEtapeCourante(etape: EtapeCycle): string {
  const slugs: Record<EtapeCycle, string> = {
    problematique: "Pourquoi apprendre",
    cours: "Cours",
    exempleExpert: "Exemple d'expert",
    exercices: "Exercices",
    recompense: "Récompense",
  };
  return slugs[etape];
}

/** Prochaine étape pour affichage (info seulement). */
export function prochaineEtapeLabel(etape: EtapeCycle): string | null {
  const suivante = etapeSuivante(etape);
  return suivante ? libelleEtapeCourante(suivante) : null;
}
