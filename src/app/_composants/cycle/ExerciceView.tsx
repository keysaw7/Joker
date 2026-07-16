"use client";

import { useState } from "react";
import type { Correction, EtatExercices, Exercice } from "@/core/domain";
import { Carte } from "../Carte";
import { ZoneTexte } from "../ZoneTexte";

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
  onRepondre?: (texte: string) => void;
  enCours?: boolean;
}

const GUIDAGE_LABELS: Record<string, string> = {
  fort: "Guidage fort",
  modere: "Guidage modéré",
  autonome: "Autonome",
};

export function ExerciceView({
  exercice,
  etatExercices,
  correctionPrecedente,
  echangesPrecedents = [],
  lectureSeule = false,
  onRepondre,
  enCours = false,
}: ExerciceViewProps) {
  const [reponse, setReponse] = useState("");

  return (
    <div className="flex flex-col gap-4 contenu-large">
      {echangesPrecedents.map((echange, index) => (
        <Carte key={index} className="border-bordure bg-fond">
          <p className="mb-2 text-xs font-medium text-texte-secondaire">
            Exercice précédent
          </p>
          <p className="mb-2 text-sm leading-relaxed">{echange.enonce}</p>
          <p className="text-sm">
            <span className="font-medium">Ta réponse : </span>
            {echange.reponse}
          </p>
          {echange.correction && (
            <p className="mt-2 text-sm text-texte-secondaire">
              {echange.correction.explicationPersonnalisee}
            </p>
          )}
        </Carte>
      ))}

      {correctionPrecedente && (
        <Carte className="border-succes bg-green-50">
          <p className="text-sm font-medium text-succes">
            {correctionPrecedente.analyse.correcte ? "Correct" : "À retravailler"}
          </p>
          <p className="mt-2 text-sm leading-relaxed">
            {correctionPrecedente.explicationPersonnalisee}
          </p>
        </Carte>
      )}

      <Carte>
        {etatExercices && (
          <p className="mb-3 text-xs text-texte-secondaire">
            {GUIDAGE_LABELS[etatExercices.guidageActuel]}
          </p>
        )}
        <p className="mb-4 text-lg leading-relaxed">{exercice.enonce}</p>

        {!lectureSeule && onRepondre ? (
          <>
            <ZoneTexte
              label="Ta réponse"
              placeholder="Réponds ici…"
              value={reponse}
              onChange={(e) => setReponse(e.target.value)}
            />
            <button
              type="button"
              disabled={!reponse.trim() || enCours}
              onClick={() => {
                onRepondre(reponse);
                setReponse("");
              }}
              className="mt-4 inline-flex items-center justify-center rounded-carte bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
            >
              {enCours ? "Validation…" : "Valider"}
            </button>
          </>
        ) : (
          <p className="text-sm text-texte-secondaire">
            Mode lecture seule — exercice déjà complété.
          </p>
        )}
      </Carte>
    </div>
  );
}
