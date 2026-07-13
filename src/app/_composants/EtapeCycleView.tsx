"use client";

import { useState } from "react";
import type { EtatCycle } from "@/core/domain";
import { progression, libelleEtape } from "@/app/_experience/progression";
import { BarreProgression } from "./BarreProgression";
import { BlocContenuView } from "./BlocContenuView";
import { Bouton } from "./Bouton";
import { Carte } from "./Carte";
import { ZoneTexte } from "./ZoneTexte";

interface EtapeCycleViewProps {
  etat: EtatCycle;
  enCours?: boolean;
  onAvancer: () => void;
  onRepondreExercice: (texte: string) => void;
  onNotionSuivante: () => void;
}

const GUIDAGE_LABELS: Record<string, string> = {
  fort: "Guidage fort",
  modere: "Guidage modéré",
  autonome: "Autonome",
};

export function EtapeCycleView({
  etat,
  enCours = false,
  onAvancer,
  onRepondreExercice,
  onNotionSuivante,
}: EtapeCycleViewProps) {
  const [reponse, setReponse] = useState("");
  const prog = progression(etat);
  const { contenu } = etat;

  return (
    <div className="flex flex-1 flex-col gap-8">
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-[var(--color-accent)]">
            {libelleEtape(etat.etape)}
          </p>
          {prog.total > 0 && (
            <span className="text-xs text-[var(--color-texte-secondaire)]">
              {prog.faites}/{prog.total} notions
            </span>
          )}
        </div>
        {prog.total > 0 && (
          <BarreProgression pourcentage={prog.pourcentage} />
        )}
      </header>

      {contenu.type === "problematique" && (
        <Carte>
          <p className="text-xl font-medium leading-relaxed">
            {contenu.problematique.intitule}
          </p>
        </Carte>
      )}

      {contenu.type === "cours" && (
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-semibold">{contenu.cours.titre}</h2>
          {contenu.cours.blocs.map((bloc, i) => (
            <Carte key={i}>
              <BlocContenuView bloc={bloc} />
            </Carte>
          ))}
        </div>
      )}

      {contenu.type === "exempleExpert" && (
        <div className="flex flex-col gap-4">
          <p className="text-[var(--color-texte-secondaire)]">
            {contenu.exemple.contexte}
          </p>
          {contenu.exemple.demonstration.map((bloc, i) => (
            <Carte key={i}>
              <BlocContenuView bloc={bloc} />
            </Carte>
          ))}
        </div>
      )}

      {contenu.type === "exercice" && (
        <div className="flex flex-col gap-4">
          {contenu.correctionPrecedente && (
            <Carte className="border-[var(--color-succes)] bg-green-50">
              <p className="text-sm font-medium text-[var(--color-succes)]">
                {contenu.correctionPrecedente.analyse.correcte
                  ? "Correct"
                  : "À retravailler"}
              </p>
              <p className="mt-2 text-sm leading-relaxed">
                {contenu.correctionPrecedente.explicationPersonnalisee}
              </p>
            </Carte>
          )}
          <Carte>
            {etat.etatExercices && (
              <p className="mb-3 text-xs text-[var(--color-texte-secondaire)]">
                {GUIDAGE_LABELS[etat.etatExercices.guidageActuel]}
              </p>
            )}
            <p className="mb-4 text-lg leading-relaxed">
              {contenu.exercice.enonce}
            </p>
            <ZoneTexte
              label="Ta réponse"
              placeholder="Réponds ici…"
              value={reponse}
              onChange={(e) => setReponse(e.target.value)}
            />
          </Carte>
        </div>
      )}

      {contenu.type === "recompense" && (
        <Carte className="text-center">
          <p className="text-2xl font-semibold text-[var(--color-succes)]">
            {contenu.recompense.message}
          </p>
          {contenu.correctionPrecedente && (
            <p className="mt-3 text-sm text-[var(--color-texte-secondaire)]">
              {contenu.correctionPrecedente.explicationPersonnalisee}
            </p>
          )}
          {etat.termine && (
            <p className="mt-4 text-lg font-medium">
              Tu as maîtrisé toutes les notions de ton parcours.
            </p>
          )}
        </Carte>
      )}

      <div className="flex gap-3">
        {(contenu.type === "problematique" ||
          contenu.type === "cours" ||
          contenu.type === "exempleExpert") && (
          <Bouton onClick={onAvancer} enCours={enCours}>
            Continuer
          </Bouton>
        )}

        {contenu.type === "exercice" && (
          <Bouton
            onClick={() => {
              onRepondreExercice(reponse);
              setReponse("");
            }}
            disabled={!reponse.trim()}
            enCours={enCours}
          >
            Valider
          </Bouton>
        )}

        {contenu.type === "recompense" && !etat.termine && (
          <Bouton onClick={onNotionSuivante} enCours={enCours}>
            Notion suivante
          </Bouton>
        )}
      </div>
    </div>
  );
}
