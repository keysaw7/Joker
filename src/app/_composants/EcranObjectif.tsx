"use client";

import { useState } from "react";
import { placeholderObjectif } from "@/app/_data/domaines";
import type { Domaine, ResumeSession, StatutSession } from "@/core/domain";
import { Bouton } from "./Bouton";
import { Carte } from "./Carte";
import { ZoneTexte } from "./ZoneTexte";

interface EcranObjectifProps {
  domaine: Domaine;
  sessions: readonly ResumeSession[];
  enCours?: boolean;
  sessionEnSuppression?: string | null;
  onCommencer: (intitule: string) => void;
  onReprendre: (objectifId: string) => void;
  onSupprimer: (objectifId: string) => void;
  onRetour: () => void;
}

function libelleStatut(statut: StatutSession): string {
  switch (statut) {
    case "diagnostic":
      return "Diagnostic";
    case "generation":
      return "Démarrage";
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
  sessionEnSuppression = null,
  onCommencer,
  onReprendre,
  onSupprimer,
  onRetour,
}: EcranObjectifProps) {
  const [intitule, setIntitule] = useState("");
  const [sessionAConfirmer, setSessionAConfirmer] = useState<string | null>(null);

  return (
    <div className="flex flex-1 flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium text-accent">{domaine.nom}</p>
        <h1 className="text-2xl font-semibold">Quel est ton objectif ?</h1>
        <p className="text-texte-secondaire">
          Reprends une session existante ou définis un nouvel objectif pour ton parcours.
        </p>
      </header>

      {sessions.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-texte-secondaire">
            Reprendre une session
          </h2>
          <ul className="flex flex-col gap-3">
            {sessions.map((session) => {
              const progression = formaterProgression(session);
              const enConfirmation = sessionAConfirmer === session.objectif.id;
              const suppressionEnCours = sessionEnSuppression === session.objectif.id;

              return (
                <li key={session.objectif.id}>
                  <Carte className="flex flex-col gap-3">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        if (!enConfirmation) {
                          onReprendre(session.objectif.id);
                        }
                      }}
                      onKeyDown={(event) => {
                        if (enConfirmation) {
                          return;
                        }
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onReprendre(session.objectif.id);
                        }
                      }}
                      className="flex cursor-pointer flex-col gap-2"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <p className="font-medium">{session.objectif.intitule}</p>
                        <span className="shrink-0 rounded-full bg-fond px-2.5 py-1 text-xs font-medium text-texte-secondaire">
                          {libelleStatut(session.statut)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-texte-secondaire">
                        <span>{formaterDate(session.miseAJour)}</span>
                        {progression && <span>{progression}</span>}
                      </div>
                    </div>

                    {enConfirmation ? (
                      <div className="flex flex-col gap-3 border-t border-bordure pt-3">
                        <p className="text-sm text-texte-secondaire">
                          Supprimer cette session ? Cette action est irréversible.
                        </p>
                        <div className="flex gap-2">
                          <Bouton
                            variante="secondaire"
                            onClick={() => setSessionAConfirmer(null)}
                            disabled={suppressionEnCours}
                          >
                            Annuler
                          </Bouton>
                          <Bouton
                            onClick={() => onSupprimer(session.objectif.id)}
                            enCours={suppressionEnCours}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Supprimer
                          </Bouton>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end border-t border-bordure pt-3">
                        <button
                          type="button"
                          onClick={() => setSessionAConfirmer(session.objectif.id)}
                          className="text-sm text-texte-secondaire transition-colors hover:text-red-600"
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </Carte>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-texte-secondaire">
          Nouvel objectif
        </h2>
        <Carte>
          <ZoneTexte
            label="Ton objectif"
            placeholder={placeholderObjectif(domaine.id)}
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
