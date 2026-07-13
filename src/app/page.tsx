"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  avancerCycle,
  demarrerCycle,
  demarrerParcours,
  listerSessions,
  notionSuivante,
  repondreDiagnostic,
  repondreExercice,
  reprendreSession,
} from "@/app/actions";
import { trouverDomaine } from "@/app/_data/domaines";
import { ChargementInvisible } from "@/app/_composants/ChargementInvisible";
import { EcranAccueil } from "@/app/_composants/EcranAccueil";
import { EcranDiagnostic } from "@/app/_composants/EcranDiagnostic";
import { EcranObjectif } from "@/app/_composants/EcranObjectif";
import { EnTeteApp } from "@/app/_composants/EnTeteApp";
import { EtapeCycleView } from "@/app/_composants/EtapeCycleView";
import { SELECTION_DEFAUT, type SelectionModele } from "@/adapters/ai/fournisseurs";
import type { Domaine, EtatCycle, EtatParcours, ResumeSession } from "@/core/domain";

type Mode =
  | "accueil"
  | "objectif"
  | "diagnostic"
  | "generation"
  | "cycle";

export default function Page() {
  const [mode, setMode] = useState<Mode>("accueil");
  const [domaine, setDomaine] = useState<Domaine | null>(null);
  const [sessions, setSessions] = useState<readonly ResumeSession[]>([]);
  const [selection] = useState<SelectionModele>(SELECTION_DEFAUT);
  const [etatParcours, setEtatParcours] = useState<EtatParcours | null>(null);
  const [etatCycle, setEtatCycle] = useState<EtatCycle | null>(null);
  const [enCours, startTransition] = useTransition();

  const retourAccueil = useCallback(() => {
    setMode("accueil");
    setDomaine(null);
    setSessions([]);
    setEtatParcours(null);
    setEtatCycle(null);
  }, []);

  const chargerSessions = useCallback((domaineId: string) => {
    startTransition(async () => {
      const liste = await listerSessions(domaineId);
      setSessions(liste);
    });
  }, []);

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

  function renderContenu() {
    if (mode === "accueil") {
      return (
        <EcranAccueil
          onChoisirDomaine={(id) => {
            const d = trouverDomaine(id);
            if (d) {
              setDomaine(d);
              setSessions([]);
              setMode("objectif");
              chargerSessions(d.id);
            }
          }}
        />
      );
    }

    if (mode === "objectif" && domaine) {
      return (
        <EcranObjectif
          domaine={domaine}
          sessions={sessions}
          enCours={enCours}
          onRetour={retourAccueil}
          onReprendre={(objectifId) => {
            startTransition(async () => {
              const session = await reprendreSession(objectifId);
              if (!session) {
                return;
              }

              switch (session.statut) {
                case "diagnostic":
                case "generation": {
                  if (!session.etatParcours) {
                    return;
                  }
                  setEtatParcours(session.etatParcours);
                  setEtatCycle(null);
                  setMode(session.statut === "generation" ? "generation" : "diagnostic");
                  break;
                }
                case "cycle":
                case "termine": {
                  if (!session.etatCycle) {
                    return;
                  }
                  setEtatCycle(session.etatCycle);
                  setEtatParcours(null);
                  setMode("cycle");
                  break;
                }
              }
            });
          }}
          onCommencer={(intitule) => {
            startTransition(async () => {
              const etat = await demarrerParcours(domaine.id, intitule, selection);
              setEtatParcours(etat);
              setEtatCycle(null);
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

  return (
    <div className="flex flex-1 flex-col gap-8">
      <EnTeteApp onAccueil={retourAccueil} surAccueil={mode === "accueil"} />
      {renderContenu()}
    </div>
  );
}
