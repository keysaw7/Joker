"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { demarrerCycle, finaliserDiagnostic } from "@/app/actions";
import { urlEtape } from "@/app/_experience/navigation";
import { EcranConstructionParcours } from "@/app/_composants/EcranConstructionParcours";
import { EcranDiagnostic } from "@/app/_composants/EcranDiagnostic";
import type { QuestionDiagnostic, ReponseDiagnostic } from "@/core/domain";

interface ClientDiagnosticProps {
  questions: readonly QuestionDiagnostic[];
}

/**
 * Après la dernière réponse : un seul écran d'attente unifié
 * (profil + roadmap + démarrage du cycle), puis navigation vers la 1ʳᵉ notion.
 */
export function ClientDiagnostic({ questions }: ClientDiagnosticProps) {
  const params = useParams<{ objectifId: string }>();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [enPreparation, setEnPreparation] = useState(false);

  if (enPreparation) {
    return <EcranConstructionParcours />;
  }

  return (
    <EcranDiagnostic
      questions={questions}
      onTerminer={(reponses: readonly ReponseDiagnostic[]) => {
        setEnPreparation(true);
        startTransition(async () => {
          try {
            await finaliserDiagnostic(params.objectifId, reponses);
            const resultat = await demarrerCycle(params.objectifId);
            router.replace(
              urlEtape(params.objectifId, resultat.notionId, resultat.etape),
            );
            router.refresh();
          } catch {
            // Si le cycle a échoué mais le diagnostic est finalisé,
            // la page /generation reprendra demarrerCycle.
            router.replace(`/session/${params.objectifId}/generation`);
            router.refresh();
          }
        });
      }}
    />
  );
}
