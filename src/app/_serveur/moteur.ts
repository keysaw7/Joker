import { creerClientSupabaseServeur } from "@/adapters/auth/supabase/serveur";
import { exigerUtilisateurCourant } from "@/adapters/auth/utilisateurCourant";
import { creerStockageAssetsSupabase } from "@/adapters/assets/supabase";
import { creerStockageAssetsMemoire } from "@/adapters/assets/memoire";
import { creerPersistanceModeleSupabase } from "@/adapters/persistence/modeleApprentissageSupabase";
import { creerPersistanceSupabase } from "@/adapters/persistence/supabase";
import { creerConcepteurDeCours } from "@/core/cours/concepteurDeCours";
import { creerLearningModel } from "@/core/modele-apprentissage";
import type {
  ConcepteurDeCours,
  GenerateurDeContenu,
  Persistance,
  PersistanceModeleApprentissage,
} from "@/core/ports";
import { creerModele } from "@/adapters/ai/creerModele";
import { creerGenerateurImage } from "@/adapters/ai/image";
import type { SelectionModele } from "@/adapters/ai/fournisseurs";
import {
  SELECTION_DEFAUT_IMAGE,
  normaliserSelection,
} from "@/adapters/ai/fournisseurs";
import { creerCapacitesMock } from "@/adapters/ai/mock/capacitesMock";
import { creerCapacitesIA } from "@/adapters/ai/partage/capacitesIA";
import { tracerCapacites } from "@/adapters/logging/tracerCapacites";
import { OrchestrateurCycle } from "@/core/cycle/orchestrateur";
import { OrchestrateurParcours } from "@/core/parcours/orchestrateurParcours";

export async function persistanceCourante(): Promise<Persistance> {
  const utilisateur = await exigerUtilisateurCourant();
  const client = await creerClientSupabaseServeur();
  return creerPersistanceSupabase(client, utilisateur.id);
}

export async function persistanceModeleCourante(): Promise<PersistanceModeleApprentissage> {
  const utilisateur = await exigerUtilisateurCourant();
  const client = await creerClientSupabaseServeur();
  return creerPersistanceModeleSupabase(client, utilisateur.id);
}

type CapacitesMock = ReturnType<typeof creerCapacitesMock>;
type CapacitesIA = ReturnType<typeof creerCapacitesIA>;
type CapacitesBrutes = CapacitesMock | CapacitesIA;

function creerCapacitesBrutes(selection: SelectionModele): CapacitesBrutes {
  if (selection.fournisseur === "mock") {
    return creerCapacitesMock();
  }
  return creerCapacitesIA(creerModele(selection));
}

/**
 * Aligne le générateur de contenu sur le pipeline riche de la refonte :
 * cours et exemple expert passent par le concepteur (enrichissement média).
 */
function alignerGenerateurContenu(
  brutes: CapacitesBrutes,
  concepteur: ConcepteurDeCours,
): GenerateurDeContenu {
  return {
    genererProblematique: (contexte, notion) =>
      brutes.generateurContenu.genererProblematique(contexte, notion),

    genererCours: (contexte, notion) =>
      concepteur.composerCours(contexte, notion),

    genererExempleExpert: async (contexte, notion) => {
      if ("planifierExempleExpert" in brutes) {
        const plan = await brutes.planifierExempleExpert(contexte, notion);
        const demonstration = await concepteur.enrichirIntentions(
          contexte,
          notion,
          plan.intentions,
        );
        return {
          notionId: notion.id,
          contexte: plan.contexte,
          demonstration,
        };
      }
      return brutes.generateurContenu.genererExempleExpert(contexte, notion);
    },
  };
}

async function creerConcepteurDepuisCapacites(
  selectionTexte: SelectionModele,
  brutes: CapacitesBrutes,
  selectionImage: SelectionModele = SELECTION_DEFAUT_IMAGE,
): Promise<ConcepteurDeCours> {
  if (selectionTexte.fournisseur === "mock") {
    return (brutes as CapacitesMock).concepteurDeCours;
  }

  const capacites = brutes as CapacitesIA;
  const utilisateur = await exigerUtilisateurCourant();
  const client = await creerClientSupabaseServeur();

  return creerConcepteurDeCours({
    planificateurCours: capacites.planificateurCours,
    generateurSchema: capacites.generateurSchema,
    generateurGraphique: capacites.generateurGraphique,
    generateurImage: creerGenerateurImage(normaliserSelection(selectionImage)),
    stockageAssets: creerStockageAssetsSupabase(client, utilisateur.id),
  });
}

export async function creerParcours(
  selection: SelectionModele,
): Promise<OrchestrateurParcours> {
  const brutes = creerCapacitesBrutes(selection);
  const capacites = tracerCapacites(brutes);
  const persistance = await persistanceCourante();
  const persistanceModele = await persistanceModeleCourante();
  const learningModel = creerLearningModel();
  return new OrchestrateurParcours({
    diagnostic: capacites.diagnostic,
    planification: capacites.planification,
    persistance,
    persistanceModele,
    learningModel,
  });
}

export async function creerCycle(
  selection: SelectionModele,
  selectionImage?: SelectionModele,
): Promise<OrchestrateurCycle> {
  const brutes = creerCapacitesBrutes(selection);
  const concepteurDeCours = await creerConcepteurDepuisCapacites(
    selection,
    brutes,
    selectionImage,
  );
  const generateurContenu = alignerGenerateurContenu(brutes, concepteurDeCours);
  const capacites = tracerCapacites({
    ...brutes,
    generateurContenu,
  });
  const persistance = await persistanceCourante();
  const persistanceModele = await persistanceModeleCourante();
  const learningModel = creerLearningModel();

  return new OrchestrateurCycle({
    generateurContenu: capacites.generateurContenu,
    concepteurDeCours,
    generateurExercices: capacites.generateurExercices,
    analyseurErreurs: capacites.analyseurErreurs,
    correcteur: capacites.correcteur,
    remediation: capacites.remediation,
    adaptation: capacites.adaptation,
    persistance,
    persistanceModele,
    learningModel,
  });
}

/** Concepteur mock avec stockage mémoire — pour tests hors auth. */
export function creerConcepteurDeCoursMock() {
  const mock = creerCapacitesMock();
  return creerConcepteurDeCours({
    planificateurCours: mock.planificateurCours,
    generateurSchema: mock.generateurSchema,
    generateurGraphique: mock.generateurGraphique,
    generateurImage: mock.generateurImage,
    stockageAssets: creerStockageAssetsMemoire(),
  });
}
