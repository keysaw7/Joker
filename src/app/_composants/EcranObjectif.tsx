"use client";

import { useState } from "react";
import type { Domaine } from "@/core/domain";
import { Bouton } from "./Bouton";
import { Carte } from "./Carte";
import { ZoneTexte } from "./ZoneTexte";

interface EcranObjectifProps {
  domaine: Domaine;
  enCours?: boolean;
  onCommencer: (intitule: string) => void;
  onRetour: () => void;
}

export function EcranObjectif({
  domaine,
  enCours = false,
  onCommencer,
  onRetour,
}: EcranObjectifProps) {
  const [intitule, setIntitule] = useState("");

  return (
    <div className="flex flex-1 flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium text-[var(--color-accent)]">{domaine.nom}</p>
        <h1 className="text-2xl font-semibold">Quel est ton objectif ?</h1>
        <p className="text-[var(--color-texte-secondaire)]">
          Définis ce que tu veux accomplir. Ce sera le fil conducteur de ton parcours.
        </p>
      </header>

      <Carte>
        <ZoneTexte
          label="Ton objectif"
          placeholder="Ex. Comprendre les dérivées, Réussir le JLPT N5…"
          value={intitule}
          onChange={(e) => setIntitule(e.target.value)}
          rows={2}
        />
      </Carte>

      <div className="flex gap-3">
        <Bouton variante="secondaire" onClick={onRetour} disabled={enCours}>
          Retour
        </Bouton>
        <Bouton
          onClick={() => onCommencer(intitule)}
          disabled={!intitule.trim()}
          enCours={enCours}
        >
          Commencer
        </Bouton>
      </div>
    </div>
  );
}
