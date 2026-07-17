"use client";

import type { Exercice } from "@/core/domain";

interface TrousExerciceProps {
  exercice: Extract<Exercice, { format: "trous" }>;
  remplissages: Record<string, string>;
  onChange: (phraseId: string, valeur: string) => void;
  disabled?: boolean;
}

function segmentsAvecTrou(texte: string): string[] {
  return texte.split("___");
}

export function TrousExercice({
  exercice,
  remplissages,
  onChange,
  disabled = false,
}: TrousExerciceProps) {
  return (
    <div className="flex flex-col gap-4">
      {exercice.phrases.map((phrase) => {
        const parties = segmentsAvecTrou(phrase.texteAvecTrous);
        return (
          <p key={phrase.id} className="text-base leading-relaxed">
            {parties.map((partie, index) => (
              <span key={`${phrase.id}-${index}`}>
                {partie}
                {index < parties.length - 1 && (
                  <input
                    type="text"
                    disabled={disabled}
                    value={remplissages[phrase.id] ?? ""}
                    onChange={(e) => onChange(phrase.id, e.target.value)}
                    className="mx-1 inline-block w-36 border-b border-bordure bg-transparent px-1 py-0.5 text-sm outline-none focus:border-accent disabled:opacity-50"
                    aria-label={`Trou ${phrase.id}`}
                  />
                )}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
