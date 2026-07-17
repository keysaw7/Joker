"use client";

import { useState } from "react";
import type { QuestionDiagnostic } from "@/core/domain";
import { Bouton } from "./Bouton";
import { Carte } from "./Carte";
import { ZoneTexte } from "./ZoneTexte";

interface EcranDiagnosticProps {
  question: QuestionDiagnostic;
  questionsPosees: number;
  maxQuestions: number;
  onValider: (texte: string) => void;
}

export function EcranDiagnostic({
  question,
  questionsPosees,
  maxQuestions,
  onValider,
}: EcranDiagnosticProps) {
  const [reponse, setReponse] = useState("");
  const numeroQuestion = questionsPosees + 1;

  function valider() {
    const texte = reponse.trim();
    if (!texte) return;
    setReponse("");
    onValider(texte);
  }

  return (
    <div className="flex flex-1 flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium text-accent">Diagnostic</p>
        <h1 className="text-2xl font-semibold">Comprendre ton niveau</h1>
        <p className="text-texte-secondaire">
          Des questions adaptées à tes réponses pour personnaliser ton parcours.
          Pas de note affichée — juste une meilleure compréhension de là où tu en
          es.
        </p>
        <p className="text-sm text-texte-secondaire">
          Question {numeroQuestion} (jusqu&apos;à {maxQuestions})
        </p>
      </header>

      <Carte>
        <p className="mb-4 text-lg leading-relaxed">{question.intitule}</p>
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
