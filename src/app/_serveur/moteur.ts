import { creerPersistanceFichier } from "@/adapters/persistence/fichier";
import type { Persistance } from "@/core/ports";
import { creerModele } from "@/adapters/ai/creerModele";
import type { SelectionModele } from "@/adapters/ai/fournisseurs";
import { creerCapacitesMock } from "@/adapters/ai/mock/capacitesMock";
import { creerCapacitesIA } from "@/adapters/ai/partage/capacitesIA";
import { tracerCapacites } from "@/adapters/logging/tracerCapacites";
import { OrchestrateurCycle } from "@/core/cycle/orchestrateur";
import { OrchestrateurParcours } from "@/core/parcours/orchestrateurParcours";

const persistance = creerPersistanceFichier();

export function memoire(): Persistance {
  return persistance;
}

type Capacites = ReturnType<typeof creerCapacitesMock>;

function obtenirCapacites(selection: SelectionModele): Capacites {
  const brutes =
    selection.fournisseur === "mock"
      ? creerCapacitesMock()
      : creerCapacitesIA(creerModele(selection));

  return tracerCapacites(brutes);
}

export function creerParcours(selection: SelectionModele): OrchestrateurParcours {
  const capacites = obtenirCapacites(selection);
  return new OrchestrateurParcours({
    diagnostic: capacites.diagnostic,
    planification: capacites.planification,
    persistance,
  });
}

export function creerCycle(selection: SelectionModele): OrchestrateurCycle {
  const capacites = obtenirCapacites(selection);
  return new OrchestrateurCycle({
    generateurContenu: capacites.generateurContenu,
    generateurExercices: capacites.generateurExercices,
    analyseurErreurs: capacites.analyseurErreurs,
    correcteur: capacites.correcteur,
    remediation: capacites.remediation,
    adaptation: capacites.adaptation,
    persistance,
  });
}
