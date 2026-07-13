import type {
  ContexteApprentissage,
  Domaine,
  Objectif,
  ProfilApprenant,
  ReponseDiagnostic,
} from "@/core/domain";

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
    miseAJour: new Date().toISOString(),
  };
}

/** Contexte de départ avant le diagnostic. */
export function contexteInitial(
  domaine: Domaine,
  objectif: Objectif,
): ContexteApprentissage {
  return {
    domaine,
    objectif,
    profil: profilInitial(objectif.id),
    roadmap: null,
    notionCouranteId: null,
    reponsesDiagnostic: [],
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
