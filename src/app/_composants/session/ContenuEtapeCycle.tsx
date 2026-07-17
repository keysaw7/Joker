"use client";

import { useState } from "react";
import type { ContenuEtape, EtapeCycle, EtatCycle } from "@/core/domain";
import { BarreActionsCycle, useActionsExercice } from "@/app/_composants/cycle/BarreActionsCycle";
import { CoursView } from "@/app/_composants/cours/CoursView";
import { ExempleExpertView } from "@/app/_composants/cycle/ExempleExpertView";
import { ExerciceView } from "@/app/_composants/cycle/ExerciceView";
import { ProblematiqueView } from "@/app/_composants/cycle/ProblematiqueView";
import { RecompenseView } from "@/app/_composants/cycle/RecompenseView";
import { BarreProgression } from "@/app/_composants/BarreProgression";
import { EcranAttente } from "@/app/_composants/attente/EcranAttente";
import type { PhaseAttente } from "@/app/_composants/attente/phasesAttente";
import { libelleEtape, progression } from "@/app/_experience/progression";

interface ContenuEtapeCycleProps {
  objectifId: string;
  etape: EtapeCycle;
  contenu: ContenuEtape;
  estCourante: boolean;
  etatCycleCourant: EtatCycle | null;
  echangesPrecedents?: readonly {
    enonce: string;
    reponse: string;
    correction?: import("@/core/domain").Correction;
  }[];
}

export function ContenuEtapeCycle({
  objectifId,
  etape,
  contenu,
  estCourante,
  etatCycleCourant,
  echangesPrecedents = [],
}: ContenuEtapeCycleProps) {
  const [phaseAttente, setPhaseAttente] = useState<PhaseAttente | null>(null);

  const { repondre, enCours: enCoursExercice } = useActionsExercice({
    objectifId,
    estCourante,
    onPhaseAttente: setPhaseAttente,
  });

  const prog = etatCycleCourant ? progression(etatCycleCourant) : null;

  const enAttente = estCourante && (phaseAttente !== null || enCoursExercice);
  const phaseAffichee =
    phaseAttente ?? (enCoursExercice ? "correctionExercice" : null);

  const entete = (
    <header className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-accent">
          {libelleEtape(etape)}
        </p>
        {prog && prog.total > 0 && (
          <span className="text-xs text-texte-secondaire">
            Notion {prog.courante || 1}/{prog.total}
            {prog.faites > 0 ? ` · ${prog.faites} maîtrisée${prog.faites > 1 ? "s" : ""}` : ""}
          </span>
        )}
      </div>
      {prog && prog.total > 0 && (
        <BarreProgression pourcentage={prog.pourcentage} />
      )}
    </header>
  );

  if (enAttente && phaseAffichee) {
    return (
      <div className="flex flex-col gap-6">
        {entete}
        <EcranAttente phase={phaseAffichee} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {entete}

      {contenu.type === "problematique" && (
        <ProblematiqueView problematique={contenu.problematique} />
      )}

      {contenu.type === "cours" && (
        <div className="contenu-lecture">
          <CoursView cours={contenu.cours} />
        </div>
      )}

      {contenu.type === "exempleExpert" && (
        <ExempleExpertView exemple={contenu.exemple} />
      )}

      {contenu.type === "exercice" && (
        <ExerciceView
          exercice={contenu.exercice}
          etatExercices={
            estCourante ? (etatCycleCourant?.etatExercices ?? null) : null
          }
          correctionPrecedente={contenu.correctionPrecedente}
          echangesPrecedents={echangesPrecedents}
          lectureSeule={!estCourante}
          onRepondre={estCourante ? repondre : undefined}
          enCours={enCoursExercice}
        />
      )}

      {contenu.type === "recompense" && (
        <RecompenseView
          recompense={contenu.recompense}
          correctionPrecedente={contenu.correctionPrecedente}
          termine={etatCycleCourant?.termine ?? false}
        />
      )}

      <BarreActionsCycle
        objectifId={objectifId}
        estCourante={estCourante}
        termine={etatCycleCourant?.termine ?? false}
        typeContenu={contenu.type}
        onPhaseAttente={setPhaseAttente}
      />
    </div>
  );
}
