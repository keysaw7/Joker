"use client";

import { useState } from "react";
import type { Domaine, ResumeSession, StatutSession } from "@/core/domain";
import { Bouton } from "./Bouton";
import { Carte } from "./Carte";
import { ZoneTexte } from "./ZoneTexte";

interface EcranObjectifProps {
  domaine: Domaine;
  sessions: readonly ResumeSession[];
  enCours?: boolean;
  onCommencer: (intitule: string) => void;
  onReprendre: (objectifId: string) => void;
  onRetour: () => void;
}

function libelleStatut(statut: StatutSession): string {
  switch (statut) {
    case "diagnostic":
      return "Diagnostic";
    case "generation":
      return "Génération";
    case "cycle":
      return "Apprentissage";
    case "termine":
      return "Terminé";
  }
}

function formaterDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formaterProgression(session: ResumeSession): string | null {
  if (session.notionsTotal === 0) {
    return null;
  }

  return `${session.notionsMaitrisees}/${session.notionsTotal} notions`;
}

export function EcranObjectif({
  domaine,
  sessions,
  enCours = false,
  onCommencer,
  onReprendre,
  onRetour,
}: EcranObjectifProps) {
  const [intitule, setIntitule] = useState("");

  return (
    <div className="flex flex-1 flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium text-[var(--color-accent)]">{domaine.nom}</p>
        <h1 className="text-2xl font-semibold">Quel est ton objectif ?</h1>
        <p className="text-[var(--color-texte-secondaire)]">
          Reprends une session existante ou définis un nouvel objectif pour ton parcours.
        </p>
      </header>

      {sessions.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-[var(--color-texte-secondaire)]">
            Reprendre une session
          </h2>
          <ul className="flex flex-col gap-3">
            {sessions.map((session) => {
              const progression = formaterProgression(session);

              return (
                <li key={session.objectif.id}>
                  <Carte
                    interactive
                    role="button"
                    tabIndex={0}
                    onClick={() => onReprendre(session.objectif.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onReprendre(session.objectif.id);
                      }
                    }}
                    className="flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <p className="font-medium">{session.objectif.intitule}</p>
                      <span className="shrink-0 rounded-full bg-[var(--color-fond)] px-2.5 py-1 text-xs font-medium text-[var(--color-texte-secondaire)]">
                        {libelleStatut(session.statut)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--color-texte-secondaire)]">
                      <span>{formaterDate(session.miseAJour)}</span>
                      {progression && <span>{progression}</span>}
                    </div>
                  </Carte>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-[var(--color-texte-secondaire)]">
          Nouvel objectif
        </h2>
        <Carte>
          <ZoneTexte
            label="Ton objectif"
            placeholder="Ex. Comprendre les dérivées, Réussir le JLPT N5…"
            value={intitule}
            onChange={(e) => setIntitule(e.target.value)}
            rows={2}
          />
        </Carte>
      </section>

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
