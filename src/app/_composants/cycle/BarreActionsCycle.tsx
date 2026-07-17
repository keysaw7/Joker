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
import type { PhaseAttente } from "@/app/_composants/attente/phasesAttente";
import { phasePourAvancerCycle } from "@/app/_composants/attente/phasesAttente";
import type { EtapeCycle, ReponseApprenant } from "@/core/domain";
import { Bouton } from "../Bouton";

interface BarreActionsCycleProps {
  objectifId: string;
  estCourante: boolean;
  termine?: boolean;
  typeContenu: "problematique" | "cours" | "exempleExpert" | "exercice" | "recompense";
  onPhaseAttente?: (phase: PhaseAttente | null) => void;
}

export function BarreActionsCycle({
  objectifId,
  estCourante,
  termine = false,
  typeContenu,
  onPhaseAttente,
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
            onPhaseAttente?.(phasePourAvancerCycle(typeContenu));
            startTransition(async () => {
              try {
                const resultat = await avancerCycle(objectifId);
                naviguerVers(resultat);
              } finally {
                onPhaseAttente?.(null);
              }
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
            onPhaseAttente?.("notionSuivante");
            startTransition(async () => {
              try {
                const resultat = await notionSuivante(objectifId);
                naviguerVers(resultat);
              } finally {
                onPhaseAttente?.(null);
              }
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
  onPhaseAttente?: (phase: PhaseAttente | null) => void;
}

export function useActionsExercice({
  objectifId,
  estCourante,
  onPhaseAttente,
}: BarreActionsExerciceProps) {
  const router = useRouter();
  const [enCours, startTransition] = useTransition();

  function repondre(reponse: ReponseApprenant) {
    if (!estCourante) {
      return;
    }
    onPhaseAttente?.("correctionExercice");
    startTransition(async () => {
      try {
        const resultat = await repondreExercice(objectifId, reponse);
        router.push(urlEtape(objectifId, resultat.notionId, resultat.etape));
        router.refresh();
      } finally {
        onPhaseAttente?.(null);
      }
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
