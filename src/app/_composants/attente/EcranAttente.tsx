"use client";

import { useEffect, useState } from "react";
import { PHASES_ATTENTE, type PhaseAttente } from "./phasesAttente";

const INTERVALLE_ETAPES_MS = 2200;

interface EcranAttenteProps {
  phase: PhaseAttente;
  /** Plein écran centré (défaut) ou bloc compact pour zones locales. */
  variant?: "plein" | "compact";
}

export function EcranAttente({ phase, variant = "plein" }: EcranAttenteProps) {
  const config = PHASES_ATTENTE[phase];
  const [indexEtape, setIndexEtape] = useState(0);
  const [cleFondu, setCleFondu] = useState(0);

  useEffect(() => {
    setIndexEtape(0);
    setCleFondu((k) => k + 1);
  }, [phase]);

  useEffect(() => {
    if (config.etapes.length <= 1) {
      return;
    }
    const id = window.setInterval(() => {
      setIndexEtape((i) => (i + 1) % config.etapes.length);
      setCleFondu((k) => k + 1);
    }, INTERVALLE_ETAPES_MS);
    return () => window.clearInterval(id);
  }, [config.etapes.length, phase]);

  const messageCourant = config.etapes[indexEtape] ?? config.etapes[0];
  const estCompact = variant === "compact";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={
        estCompact
          ? "flex flex-col items-center gap-4 py-8 text-center"
          : "flex flex-1 flex-col items-center justify-center gap-6 text-center"
      }
    >
      <div className="attente-orbe" aria-hidden>
        <span className="attente-orbe-anneau" />
        <span className="attente-orbe-noyau" />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-accent">{config.titre}</p>
        <p
          key={cleFondu}
          className={`attente-message-fondu text-texte-secondaire ${
            estCompact ? "text-sm" : "text-lg"
          }`}
        >
          {messageCourant}
        </p>
      </div>

      <div className="flex gap-1.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span key={i} className="attente-point" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}
