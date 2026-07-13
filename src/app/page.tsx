"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  avancerCycle,
  demarrerCycle,
  demarrerParcours,
  notionSuivante,
  repondreDiagnostic,
  repondreExercice,
} from "@/app/actions";
import { trouverDomaine } from "@/app/_data/domaines";
import { ChargementInvisible } from "@/app/_composants/ChargementInvisible";
import { EcranAccueil } from "@/app/_composants/EcranAccueil";
import { EcranDiagnostic } from "@/app/_composants/EcranDiagnostic";
import { EcranObjectif } from "@/app/_composants/EcranObjectif";
import { EtapeCycleView } from "@/app/_composants/EtapeCycleView";
import { SELECTION_DEFAUT, type SelectionModele } from "@/adapters/ai/fournisseurs";
import type { Domaine, EtatCycle, EtatParcours } from "@/core/domain";

type Mode =
  | "accueil"
  | "objectif"
  | "diagnostic"
  | "generation"
  | "cycle";

export default function Page() {
  const [mode, setMode] = useState<Mode>("accueil");
  const [domaine, setDomaine] = useState<Domaine | null>(null);
  const [selection, setSelection] = useState<SelectionModele>(SELECTION_DEFAUT);
  const [etatParcours, setEtatParcours] = useState<EtatParcours | null>(null);
  const [etatCycle, setEtatCycle] = useState<EtatCycle | null>(null);
  const [enCours, startTransition] = useTransition();

  const lancerCycle = useCallback(
    (contexte: EtatParcours["contexte"]) => {
      startTransition(async () => {
        const etat = await demarrerCycle(contexte, selection);
        setEtatCycle(etat);
        setMode("cycle");
      });
    },
    [selection],
  );

  useEffect(() => {
    if (mode === "generation" && etatParcours?.phase === "pret") {
      lancerCycle(etatParcours.contexte);
    }
  }, [mode, etatParcours, lancerCycle]);

  if (mode === "accueil") {
    return (
      <EcranAccueil
        selection={selection}
        onChangerSelection={setSelection}
        onChoisirDomaine={(id) => {
          const d = trouverDomaine(id);
          if (d) {
            setDomaine(d);
            setMode("objectif");
          }
        }}
      />
    );
  }

  if (mode === "objectif" && domaine) {
    return (
      <EcranObjectif
        domaine={domaine}
        enCours={enCours}
        onRetour={() => setMode("accueil")}
        onCommencer={(intitule) => {
          startTransition(async () => {
            const etat = await demarrerParcours(domaine.id, intitule, selection);
            setEtatParcours(etat);
            setMode("diagnostic");
          });
        }}
      />
    );
  }

  if (mode === "diagnostic" && etatParcours) {
    return (
      <EcranDiagnostic
        etat={etatParcours}
        enCours={enCours}
        onRepondre={(texte) => {
          startTransition(async () => {
            const etat = await repondreDiagnostic(etatParcours, texte, selection);
            setEtatParcours(etat);
            if (etat.phase === "pret") {
              setMode("generation");
            }
          });
        }}
      />
    );
  }

  if (mode === "generation") {
    return <ChargementInvisible />;
  }

  if (mode === "cycle" && etatCycle) {
    return (
      <EtapeCycleView
        etat={etatCycle}
        enCours={enCours}
        onAvancer={() => {
          startTransition(async () => {
            const etat = await avancerCycle(etatCycle, selection);
            setEtatCycle(etat);
          });
        }}
        onRepondreExercice={(texte) => {
          startTransition(async () => {
            const etat = await repondreExercice(etatCycle, texte, selection);
            setEtatCycle(etat);
          });
        }}
        onNotionSuivante={() => {
          startTransition(async () => {
            const etat = await notionSuivante(etatCycle, selection);
            setEtatCycle(etat);
          });
        }}
      />
    );
  }

  return null;
}
