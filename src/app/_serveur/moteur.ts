import { creerModele } from "@/adapters/ai/creerModele";
import type { SelectionModele } from "@/adapters/ai/fournisseurs";
import { creerCapacitesMock } from "@/adapters/ai/mock/capacitesMock";
import { creerCapacitesIA } from "@/adapters/ai/partage/capacitesIA";
import { creerPersistanceMemoire } from "@/adapters/persistence/memoire";
import { OrchestrateurCycle } from "@/core/cycle/orchestrateur";
import { OrchestrateurParcours } from "@/core/parcours/orchestrateurParcours";

const persistance = creerPersistanceMemoire();

type Capacites = ReturnType<typeof creerCapacitesMock>;

function obtenirCapacites(selection: SelectionModele): Capacites {
  if (selection.fournisseur === "mock") {
    return creerCapacitesMock();
  }
  return creerCapacitesIA(creerModele(selection));
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
