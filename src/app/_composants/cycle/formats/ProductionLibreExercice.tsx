"use client";

import type { Exercice } from "@/core/domain";
import { ZoneTexte } from "../../ZoneTexte";

interface ProductionLibreExerciceProps {
  exercice: Extract<Exercice, { format: "production_libre" }>;
  valeur: string;
  onChange: (valeur: string) => void;
  disabled?: boolean;
}

export function ProductionLibreExercice({
  exercice,
  valeur,
  onChange,
  disabled = false,
}: ProductionLibreExerciceProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-base leading-relaxed">{exercice.enonce}</p>
      {exercice.aide && (
        <p className="rounded-carte border border-bordure bg-fond px-3 py-2 text-sm text-texte-secondaire">
          {exercice.aide}
        </p>
      )}
      {exercice.criteres && exercice.criteres.length > 0 && (
        <ul className="list-disc pl-5 text-sm text-texte-secondaire">
          {exercice.criteres.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      )}
      {!disabled && (
        <ZoneTexte
          label="Ta réponse"
          placeholder="Réponds ici…"
          value={valeur}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
