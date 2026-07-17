import type {
  Croyance,
  EtatGrapheCompetences,
  FrequenceErreur,
  ModeleApprenant,
  Observation,
  PreuveObservation,
} from "@/core/domain";
import { croyanceInitiale, modeleApprenantInitial } from "@/core/domain";
import type { MoteurInference } from "@/core/ports";
import {
  FACTEUR_PROPAGATION,
  mettreAJourCroyanceBeta,
  succesDepuisMaitrise,
} from "./beta";

function prerequisDe(
  graphe: EtatGrapheCompetences,
  noeudId: string,
): readonly string[] {
  return graphe.relations
    .filter((r) => r.type === "prerequis_de" && r.vers === noeudId)
    .map((r) => r.de);
}

function succesDepuisPreuve(preuve: PreuveObservation): number | null {
  switch (preuve.type) {
    case "reponse_diagnostic":
      return succesDepuisMaitrise(preuve.maitrise);
    case "reponse_exercice":
      return preuve.correcte ? 1 : 0;
    case "revision":
      return preuve.succes ? 1 : 0;
    case "preference_format":
      // Traité uniquement via efficaciteParFormat, pas les croyances de nœuds.
      return null;
    case "oubli_detecte":
      return 1 - preuve.intensite;
    case "utilisation_indice":
      return 0.35;
    case "abandon":
      return 0.15;
    case "temps_reflexion":
    case "confiance_declaree":
      return null;
  }
}

function enregistrerErreur(
  erreurs: Readonly<Record<string, FrequenceErreur>>,
  observation: Observation,
): Readonly<Record<string, FrequenceErreur>> {
  const { preuve } = observation;
  let libelle: string | undefined;
  if (preuve.type === "reponse_diagnostic" && preuve.lacuneDetectee) {
    libelle = preuve.lacuneDetectee;
  } else if (preuve.type === "reponse_exercice") {
    libelle =
      preuve.erreurCognitive ??
      preuve.confusion ??
      preuve.connaissanceManquante;
  }
  if (!libelle) {
    return erreurs;
  }

  const erreurId = libelle
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "erreur";

  const existante = erreurs[erreurId];
  const suivante: FrequenceErreur = {
    erreurId,
    libelle,
    occurrences: (existante?.occurrences ?? 0) + 1,
    derniereOccurrence: observation.horodatage,
    tendance: existante ? Math.min(1, existante.tendance + 0.15) : 0.3,
  };
  return { ...erreurs, [erreurId]: suivante };
}

function integrerUne(
  modele: ModeleApprenant,
  observation: Observation,
  graphe: EtatGrapheCompetences,
): ModeleApprenant {
  const succes = succesDepuisPreuve(observation.preuve);
  const croyances: Record<string, Croyance> = { ...modele.croyances };
  let preferences = modele.preferences;

  if (succes !== null) {
    const noeudsCibles =
      observation.noeudIds.length > 0
        ? observation.noeudIds
        : Object.keys(croyances);

    for (const noeudId of noeudsCibles) {
      croyances[noeudId] = mettreAJourCroyanceBeta(
        croyances[noeudId],
        noeudId,
        succes,
        observation.horodatage,
      );

      for (const prereq of prerequisDe(graphe, noeudId)) {
        const relation = graphe.relations.find(
          (r) =>
            r.type === "prerequis_de" &&
            r.de === prereq &&
            r.vers === noeudId,
        );
        const poids = (relation?.poids ?? 1) * FACTEUR_PROPAGATION;
        croyances[prereq] = mettreAJourCroyanceBeta(
          croyances[prereq],
          prereq,
          succes,
          observation.horodatage,
          poids,
        );
      }
    }
  }

  if (observation.preuve.type === "preference_format") {
    const format = observation.preuve.format;
    const existante =
      preferences.efficaciteParFormat[format] ??
      croyanceInitiale(`format:${format}`, observation.horodatage);
    preferences = {
      ...preferences,
      efficaciteParFormat: {
        ...preferences.efficaciteParFormat,
        [format]: mettreAJourCroyanceBeta(
          existante,
          `format:${format}`,
          observation.preuve.succes ? 1 : 0,
          observation.horodatage,
        ),
      },
    };
  }

  const erreurs = enregistrerErreur(modele.erreurs, observation);

  return {
    ...modele,
    version: modele.version + 1,
    croyances,
    preferences,
    erreurs,
    historiqueObservationIds: [
      ...modele.historiqueObservationIds,
      observation.id,
    ],
    miseAJour: observation.horodatage,
  };
}

export function creerMoteurInferenceBeta(): MoteurInference {
  return {
    initialiser(eleveId, priors) {
      return modeleApprenantInitial(eleveId, priors);
    },

    integrer(modele, observation, graphe) {
      return integrerUne(modele, observation, graphe);
    },

    integrerLot(modele, observations, graphe) {
      return observations.reduce(
        (acc, obs) => integrerUne(acc, obs, graphe),
        modele,
      );
    },
  };
}
