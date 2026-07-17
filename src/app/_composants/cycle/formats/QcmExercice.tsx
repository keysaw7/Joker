"use client";

import type { Exercice } from "@/core/domain";

interface QcmExerciceProps {
  exercice: Extract<Exercice, { format: "qcm" }>;
  indexChoisi: number | null;
  onChange: (index: number) => void;
  disabled?: boolean;
}

export function QcmExercice({
  exercice,
  indexChoisi,
  onChange,
  disabled = false,
}: QcmExerciceProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-base font-medium leading-relaxed">{exercice.question}</p>
      <ul className="flex flex-col gap-2">
        {exercice.options.map((option, index) => {
          const selectionne = indexChoisi === index;
          return (
            <li key={index}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(index)}
                className={`w-full rounded-carte border px-4 py-3 text-left text-sm transition-colors ${
                  selectionne
                    ? "border-accent bg-accent/10 text-texte"
                    : "border-bordure bg-fond hover:border-accent/50"
                } disabled:opacity-50`}
              >
                <span className="mr-2 text-texte-secondaire">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
