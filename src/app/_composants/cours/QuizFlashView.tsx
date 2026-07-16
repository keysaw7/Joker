"use client";

import { useState } from "react";
import { Bouton } from "../Bouton";

interface QuizFlashViewProps {
  question: string;
  options: readonly string[];
  bonneReponse: number;
  explication: string;
}

export function QuizFlashView({
  question,
  options,
  bonneReponse,
  explication,
}: QuizFlashViewProps) {
  const [selection, setSelection] = useState<number | null>(null);
  const [valide, setValide] = useState(false);

  const correct = selection === bonneReponse;

  return (
    <div className="flex flex-col gap-4">
      <span className="text-xs font-medium uppercase tracking-wide text-accent">
        Quiz rapide
      </span>
      <p className="text-lg font-medium">{question}</p>
      <ul className="flex flex-col gap-2">
        {options.map((option, index) => {
          const estSelection = selection === index;
          const estBonne = valide && index === bonneReponse;
          const estMauvaise = valide && estSelection && !correct;

          return (
            <li key={index}>
              <button
                type="button"
                disabled={valide}
                onClick={() => setSelection(index)}
                className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                  estBonne
                    ? "border-succes bg-green-50"
                    : estMauvaise
                      ? "border-red-300 bg-red-50"
                      : estSelection
                        ? "border-accent bg-blue-50"
                        : "border-bordure hover:bg-fond"
                }`}
              >
                {option}
              </button>
            </li>
          );
        })}
      </ul>
      {!valide && (
        <Bouton onClick={() => setValide(true)} disabled={selection === null}>
          Vérifier
        </Bouton>
      )}
      {valide && (
        <p
          className={`text-sm leading-relaxed ${correct ? "text-succes" : "text-texte-secondaire"}`}
        >
          {correct ? "Bravo ! " : "Pas tout à fait. "}
          {explication}
        </p>
      )}
    </div>
  );
}
