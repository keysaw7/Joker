"use client";

import { useEffect, useState } from "react";
import type {
  Correction,
  EtatExercices,
  Exercice,
  ReponseApprenant,
} from "@/core/domain";
import { Carte } from "../Carte";
import { CorrectionView } from "./CorrectionView";
import { AppariementExercice } from "./formats/AppariementExercice";
import { ProductionLibreExercice } from "./formats/ProductionLibreExercice";
import { QcmExercice } from "./formats/QcmExercice";
import { TrousExercice } from "./formats/TrousExercice";

interface ExerciceViewProps {
  exercice: Exercice;
  etatExercices?: EtatExercices | null;
  correctionPrecedente?: Correction;
  echangesPrecedents?: readonly {
    enonce: string;
    reponse: string;
    correction?: Correction;
  }[];
  lectureSeule?: boolean;
  onRepondre?: (reponse: ReponseApprenant) => void;
  enCours?: boolean;
}

const GUIDAGE_LABELS: Record<string, string> = {
  fort: "Guidage fort",
  modere: "Guidage modéré",
  autonome: "Autonome",
};

const FORMAT_LABELS: Record<Exercice["format"], string> = {
  qcm: "QCM",
  trous: "Phrases à trous",
  appariement: "Appariement",
  production_libre: "Production libre",
};

function reponseComplete(
  exercice: Exercice,
  etat: {
    indexChoisi: number | null;
    remplissages: Record<string, string>;
    associations: Record<string, string>;
    texteLibre: string;
  },
): boolean {
  switch (exercice.format) {
    case "qcm":
      return etat.indexChoisi != null;
    case "trous":
      return exercice.phrases.every((p) => (etat.remplissages[p.id] ?? "").trim());
    case "appariement":
      return exercice.paires.every((p) => (etat.associations[p.id] ?? "").trim());
    case "production_libre":
      return etat.texteLibre.trim().length > 0;
  }
}

function construireReponse(
  exercice: Exercice,
  etat: {
    indexChoisi: number | null;
    remplissages: Record<string, string>;
    associations: Record<string, string>;
    texteLibre: string;
  },
): ReponseApprenant | null {
  if (!reponseComplete(exercice, etat)) {
    return null;
  }
  switch (exercice.format) {
    case "qcm":
      return {
        exerciceId: exercice.id,
        format: "qcm",
        indexChoisi: etat.indexChoisi!,
      };
    case "trous": {
      const remplissages: Record<string, string[]> = {};
      for (const phrase of exercice.phrases) {
        remplissages[phrase.id] = [etat.remplissages[phrase.id]!.trim()];
      }
      return { exerciceId: exercice.id, format: "trous", remplissages };
    }
    case "appariement":
      return {
        exerciceId: exercice.id,
        format: "appariement",
        associations: { ...etat.associations },
      };
    case "production_libre":
      return {
        exerciceId: exercice.id,
        format: "production_libre",
        contenu: etat.texteLibre.trim(),
      };
  }
}

export function ExerciceView({
  exercice,
  etatExercices,
  correctionPrecedente,
  echangesPrecedents = [],
  lectureSeule = false,
  onRepondre,
  enCours = false,
}: ExerciceViewProps) {
  const [indexChoisi, setIndexChoisi] = useState<number | null>(null);
  const [remplissages, setRemplissages] = useState<Record<string, string>>({});
  const [associations, setAssociations] = useState<Record<string, string>>({});
  const [texteLibre, setTexteLibre] = useState("");

  useEffect(() => {
    setIndexChoisi(null);
    setRemplissages({});
    setAssociations({});
    setTexteLibre("");
  }, [exercice.id]);

  const etatSaisie = { indexChoisi, remplissages, associations, texteLibre };
  const peutValider =
    !lectureSeule &&
    onRepondre &&
    reponseComplete(exercice, etatSaisie) &&
    !enCours;

  return (
    <div className="flex flex-col gap-4 contenu-large">
      {echangesPrecedents.map((echange, index) => (
        <Carte key={index} className="border-bordure bg-fond">
          <p className="mb-2 text-xs font-medium text-texte-secondaire">
            Exercice précédent
          </p>
          <p className="mb-2 whitespace-pre-wrap text-sm leading-relaxed">
            {echange.enonce}
          </p>
          <p className="text-sm">
            <span className="font-medium">Ta réponse : </span>
            {echange.reponse}
          </p>
          {echange.correction && (
            <p className="mt-2 text-sm text-texte-secondaire">
              {echange.correction.resume}
            </p>
          )}
        </Carte>
      ))}

      {correctionPrecedente && <CorrectionView correction={correctionPrecedente} />}

      <Carte>
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-texte-secondaire">
          {etatExercices && <span>{GUIDAGE_LABELS[etatExercices.guidageActuel]}</span>}
          <span className="rounded-full border border-bordure px-2 py-0.5">
            {FORMAT_LABELS[exercice.format]}
          </span>
        </div>

        <p className="mb-4 text-lg font-medium leading-relaxed">{exercice.consigne}</p>

        {exercice.format === "qcm" && (
          <QcmExercice
            exercice={exercice}
            indexChoisi={indexChoisi}
            onChange={setIndexChoisi}
            disabled={lectureSeule || enCours}
          />
        )}
        {exercice.format === "trous" && (
          <TrousExercice
            exercice={exercice}
            remplissages={remplissages}
            onChange={(id, valeur) =>
              setRemplissages((prev) => ({ ...prev, [id]: valeur }))
            }
            disabled={lectureSeule || enCours}
          />
        )}
        {exercice.format === "appariement" && (
          <AppariementExercice
            exercice={exercice}
            associations={associations}
            onChange={(id, droite) =>
              setAssociations((prev) => ({ ...prev, [id]: droite }))
            }
            disabled={lectureSeule || enCours}
          />
        )}
        {exercice.format === "production_libre" && (
          <ProductionLibreExercice
            exercice={exercice}
            valeur={texteLibre}
            onChange={setTexteLibre}
            disabled={lectureSeule || enCours}
          />
        )}

        {!lectureSeule && onRepondre ? (
          <button
            type="button"
            disabled={!peutValider}
            onClick={() => {
              const reponse = construireReponse(exercice, etatSaisie);
              if (!reponse) return;
              onRepondre(reponse);
              setIndexChoisi(null);
              setRemplissages({});
              setAssociations({});
              setTexteLibre("");
            }}
            className="mt-4 inline-flex items-center justify-center rounded-carte bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {enCours ? "Validation…" : "Valider"}
          </button>
        ) : (
          <p className="mt-4 text-sm text-texte-secondaire">
            Mode lecture seule — exercice déjà complété.
          </p>
        )}
      </Carte>
    </div>
  );
}
