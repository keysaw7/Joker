"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { demarrerCycle, repondreDiagnostic } from "@/app/actions";
import { urlEtape } from "@/app/_experience/navigation";
import { EcranAttente } from "@/app/_composants/attente/EcranAttente";
import type { PhaseAttente } from "@/app/_composants/attente/phasesAttente";
import { EcranDiagnostic } from "@/app/_composants/EcranDiagnostic";
import type { QuestionDiagnostic } from "@/core/domain";
import { MIN_QUESTIONS, MAX_QUESTIONS } from "@/core/parcours/reglesDiagnostic";

interface ClientDiagnosticProps {
  questionCourante: QuestionDiagnostic;
  questionsPosees: number;
}

/**
 * Après la dernière réponse : un seul écran d'attente unifié
 * (profil + roadmap + démarrage du cycle), puis navigation vers la 1ʳᵉ notion.
 */
export function ClientDiagnostic({
  questionCourante: questionInitiale,
  questionsPosees: poseesInitiales,
}: ClientDiagnosticProps) {
  const params = useParams<{ objectifId: string }>();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [enPreparation, setEnPreparation] = useState(false);
  const [phaseAttente, setPhaseAttente] = useState<PhaseAttente>("questionDiagnostic");
  const [questionCourante, setQuestionCourante] =
    useState<QuestionDiagnostic>(questionInitiale);
  const [questionsPosees, setQuestionsPosees] = useState(poseesInitiales);

  if (enPreparation || isPending) {
    const phase = enPreparation ? "constructionParcours" : phaseAttente;
    return <EcranAttente phase={phase} />;
  }

  return (
    <EcranDiagnostic
      question={questionCourante}
      questionsPosees={questionsPosees}
      maxQuestions={MAX_QUESTIONS}
      onValider={(texte) => {
        const phaseReponse: PhaseAttente =
          questionsPosees >= MIN_QUESTIONS - 1
            ? "constructionParcours"
            : "questionDiagnostic";
        setPhaseAttente(phaseReponse);

        startTransition(async () => {
          try {
            const resultat = await repondreDiagnostic(params.objectifId, texte);
            if (resultat.termine) {
              setEnPreparation(true);
              try {
                const cycle = await demarrerCycle(params.objectifId);
                router.replace(
                  urlEtape(params.objectifId, cycle.notionId, cycle.etape),
                );
                router.refresh();
              } catch {
                router.replace(`/session/${params.objectifId}/generation`);
                router.refresh();
              }
              return;
            }
            if (resultat.question) {
              setQuestionCourante(resultat.question);
              setQuestionsPosees(resultat.questionsPosees);
            }
          } catch {
            router.refresh();
          }
        });
      }}
    />
  );
}
