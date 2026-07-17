import type {
  ContexteApprentissage,
  Domaine,
  Objectif,
  ProfilApprenant,
  ReponseDiagnostic,
} from "@/core/domain";
import { modeleApprenantInitial } from "@/core/domain";

/** Profil vide au démarrage d'un nouvel objectif. */
export function profilInitial(objectifId: string): ProfilApprenant {
  return {
    objectifId,
    acquis: [],
    competences: [],
    lacunes: [],
    erreursFrequentes: [],
    preferencesPedagogiques: [],
    notionsMaitrisees: [],
    niveauEstime: null,
    miseAJour: new Date().toISOString(),
  };
}

/** Contexte de départ avant le diagnostic. */
export function contexteInitial(
  domaine: Domaine,
  objectif: Objectif,
  eleveId: string = objectif.id,
): ContexteApprentissage {
  return {
    domaine,
    objectif,
    profil: profilInitial(objectif.id),
    roadmap: null,
    notionCouranteId: null,
    reponsesDiagnostic: [],
    estimationNiveau: null,
    modeleApprenant: modeleApprenantInitial(eleveId),
    grapheCompetences: null,
  };
}

/** Ajoute immuablement une réponse au diagnostic. */
export function ajouterReponse(
  contexte: ContexteApprentissage,
  reponse: ReponseDiagnostic,
): ContexteApprentissage {
  return {
    ...contexte,
    reponsesDiagnostic: [...contexte.reponsesDiagnostic, reponse],
  };
}
