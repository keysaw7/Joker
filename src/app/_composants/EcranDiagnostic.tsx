"use client";

import { useState } from "react";
import type { EtatParcours } from "@/core/domain";
import { Bouton } from "./Bouton";
import { Carte } from "./Carte";
import { ZoneTexte } from "./ZoneTexte";

interface EcranDiagnosticProps {
  etat: EtatParcours;
  enCours?: boolean;
  onRepondre: (texte: string) => void;
}

export function EcranDiagnostic({ etat, enCours = false, onRepondre }: EcranDiagnosticProps) {
  const [reponse, setReponse] = useState("");

  return (
    <div className="flex flex-1 flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium text-[var(--color-accent)]">Diagnostic</p>
        <h1 className="text-2xl font-semibold">Comprendre ton niveau</h1>
        <p className="text-[var(--color-texte-secondaire)]">
          Quelques questions pour personnaliser ton parcours. Pas de note, juste une
          meilleure compréhension de là où tu en es.
        </p>
      </header>

      <Carte>
        <p className="mb-4 text-lg leading-relaxed">
          {etat.questionCourante?.intitule}
        </p>
        <ZoneTexte
          label="Ta réponse"
          placeholder="Réponds librement…"
          value={reponse}
          onChange={(e) => setReponse(e.target.value)}
        />
      </Carte>

      <Bouton
        onClick={() => {
          onRepondre(reponse);
          setReponse("");
        }}
        disabled={!reponse.trim()}
        enCours={enCours}
      >
        Valider
      </Bouton>
    </div>
  );
}
