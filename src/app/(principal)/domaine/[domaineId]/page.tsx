"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  demarrerParcours,
  listerSessions,
  supprimerSession,
} from "@/app/actions";
import { urlSession } from "@/app/_experience/navigation";
import { trouverDomaine } from "@/app/_data/domaines";
import { EcranObjectif } from "@/app/_composants/EcranObjectif";
import type { Domaine, ResumeSession } from "@/core/domain";

export default function PageDomaine() {
  const params = useParams<{ domaineId: string }>();
  const router = useRouter();
  const domaineId = params.domaineId;
  const domaine = trouverDomaine(domaineId) as Domaine | undefined;

  const [sessions, setSessions] = useState<readonly ResumeSession[]>([]);
  const [sessionEnSuppression, setSessionEnSuppression] = useState<string | null>(null);
  const [demarrageEnCours, startDemarrage] = useTransition();
  const [suppressionEnCours, startSuppression] = useTransition();

  const chargerSessions = useCallback(async () => {
    const liste = await listerSessions(domaineId);
    setSessions(liste);
  }, [domaineId]);

  useEffect(() => {
    void chargerSessions();
  }, [chargerSessions]);

  if (!domaine) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-texte-secondaire">Domaine introuvable.</p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-accent hover:underline"
        >
          Retour à l&apos;accueil
        </button>
      </div>
    );
  }

  return (
    <EcranObjectif
      domaine={domaine}
      sessions={sessions}
      demarrageEnCours={demarrageEnCours}
      suppressionEnCours={suppressionEnCours}
      sessionEnSuppression={sessionEnSuppression}
      onRetour={() => router.push("/")}
      onReprendre={(objectifId) => {
        router.push(urlSession(objectifId));
      }}
      onSupprimer={(objectifId) => {
        setSessionEnSuppression(objectifId);
        startSuppression(async () => {
          await supprimerSession(objectifId);
          await chargerSessions();
          setSessionEnSuppression(null);
        });
      }}
      onCommencer={(intitule) => {
        startDemarrage(async () => {
          const objectifId = await demarrerParcours(domaine.id, intitule);
          router.push(`/session/${objectifId}/diagnostic`);
        });
      }}
    />
  );
}
