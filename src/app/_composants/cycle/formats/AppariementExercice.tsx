"use client";

import { useMemo } from "react";
import type { Exercice } from "@/core/domain";

interface AppariementExerciceProps {
  exercice: Extract<Exercice, { format: "appariement" }>;
  associations: Record<string, string>;
  onChange: (paireId: string, droite: string) => void;
  disabled?: boolean;
}

/** Mélange déterministe (stable SSR / hydratation) à partir d'une graine. */
function melangerDeterministe<T>(items: readonly T[], graine: string): T[] {
  const copie = [...items];
  let h = 0;
  for (let i = 0; i < graine.length; i++) {
    h = (Math.imul(31, h) + graine.charCodeAt(i)) | 0;
  }
  for (let i = copie.length - 1; i > 0; i--) {
    h = (Math.imul(h, 1103515245) + 12345) | 0;
    const j = Math.abs(h) % (i + 1);
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
  }
  return copie;
}

export function AppariementExercice({
  exercice,
  associations,
  onChange,
  disabled = false,
}: AppariementExerciceProps) {
  const optionsDroite = useMemo(() => {
    const valeurs = [
      ...exercice.paires.map((p) => p.droite),
      ...(exercice.distracteurs ?? []),
    ];
    return melangerDeterministe([...new Set(valeurs)], exercice.id);
  }, [exercice.id, exercice.paires, exercice.distracteurs]);

  return (
    <div className="flex flex-col gap-3">
      {exercice.paires.map((paire) => (
        <div
          key={paire.id}
          className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3"
        >
          <span className="min-w-[8rem] text-sm font-medium">{paire.gauche}</span>
          <select
            disabled={disabled}
            value={associations[paire.id] ?? ""}
            onChange={(e) => onChange(paire.id, e.target.value)}
            className="rounded-carte border border-bordure bg-fond px-3 py-2 text-sm outline-none focus:border-accent disabled:opacity-50"
          >
            <option value="">Choisir…</option>
            {optionsDroite.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
