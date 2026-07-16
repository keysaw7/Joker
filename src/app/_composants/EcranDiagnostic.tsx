"use client";

import { useState } from "react";
import type { QuestionDiagnostic, ReponseDiagnostic } from "@/core/domain";
import { Bouton } from "./Bouton";
import { Carte } from "./Carte";
import { ZoneTexte } from "./ZoneTexte";

interface EcranDiagnosticProps {
  questions: readonly QuestionDiagnostic[];
  onTerminer: (reponses: readonly ReponseDiagnostic[]) => void;
}

export function EcranDiagnostic({ questions, onTerminer }: EcranDiagnosticProps) {
  const [index, setIndex] = useState(0);
  const [reponses, setReponses] = useState<ReponseDiagnostic[]>([]);
  const [reponse, setReponse] = useState("");

  const questionCourante = questions[index];
  const derniereQuestion = index + 1 >= questions.length;

  if (!questionCourante) {
    return null;
  }

  function valider() {
    const courante = questions[index];
    if (!courante) return;

    const nouvelleReponse: ReponseDiagnostic = {
      questionId: courante.id,
      reponse: reponse.trim(),
    };
    const nouvellesReponses = [...reponses, nouvelleReponse];
    setReponse("");

    if (derniereQuestion) {
      onTerminer(nouvellesReponses);
      return;
    }

    setReponses(nouvellesReponses);
    setIndex((courant) => courant + 1);
  }

  return (
    <div className="flex flex-1 flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium text-accent">Diagnostic</p>
        <h1 className="text-2xl font-semibold">Comprendre ton niveau</h1>
        <p className="text-texte-secondaire">
          Quelques questions pour personnaliser ton parcours. Pas de note, juste une
          meilleure compréhension de là où tu en es.
        </p>
        <p className="text-sm text-texte-secondaire">
          Question {index + 1} / {questions.length}
        </p>
      </header>

      <Carte>
        <p className="mb-4 text-lg leading-relaxed">{questionCourante.intitule}</p>
        <ZoneTexte
          label="Ta réponse"
          placeholder="Réponds librement…"
          value={reponse}
          onChange={(e) => setReponse(e.target.value)}
        />
      </Carte>

      <Bouton onClick={valider} disabled={!reponse.trim()}>
        Valider
      </Bouton>
    </div>
  );
}
