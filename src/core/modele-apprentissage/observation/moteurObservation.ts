import type { Observation } from "@/core/domain";
import type { MoteurObservation, SignalComportemental } from "@/core/ports";

function nouvelId(): string {
  return crypto.randomUUID();
}

export function creerMoteurObservation(): MoteurObservation {
  return {
    depuisEvaluationDiagnostic(question, evaluation, contexte) {
      const observation: Observation = {
        id: nouvelId(),
        eleveId: contexte.eleveId,
        type: "reponse_diagnostic",
        horodatage: new Date().toISOString(),
        noeudIds: contexte.noeudIds.length > 0
          ? contexte.noeudIds
          : [question.competenceId],
        preuve: {
          type: "reponse_diagnostic",
          questionId: question.id,
          maitrise: evaluation.maitrise,
          difficulte: question.difficulte,
          lacuneDetectee: evaluation.lacuneDetectee,
        },
        meta: {
          sessionId: contexte.sessionId,
          objectifId: contexte.objectifId,
          source: "diagnostic",
        },
      };
      return observation;
    },

    depuisReponseExercice(exercice, analyse, contexte) {
      const observations: Observation[] = [
        {
          id: nouvelId(),
          eleveId: contexte.eleveId,
          type: "reponse_exercice",
          horodatage: new Date().toISOString(),
          noeudIds:
            contexte.noeudIds.length > 0
              ? contexte.noeudIds
              : [contexte.notionId],
          preuve: {
            type: "reponse_exercice",
            exerciceId: exercice.id,
            correcte: analyse.correcte,
            guidage: exercice.guidage,
            connaissanceManquante: analyse.connaissanceManquante,
            confusion: analyse.confusion,
            erreurCognitive: analyse.erreurCognitive,
          },
          meta: {
            sessionId: contexte.sessionId,
            objectifId: contexte.objectifId,
            notionId: contexte.notionId,
            source: "cycle",
          },
        },
      ];
      return observations;
    },

    depuisSignalComportemental(signal: SignalComportemental) {
      const base = {
        id: nouvelId(),
        eleveId: signal.eleveId,
        horodatage: new Date().toISOString(),
        noeudIds: signal.noeudIds,
        meta: {
          sessionId: signal.sessionId,
          objectifId: signal.objectifId,
          notionId: signal.notionId,
          source: "ui" as const,
        },
      };

      switch (signal.type) {
        case "utilisation_indice":
          return {
            ...base,
            type: "utilisation_indice",
            preuve: {
              type: "utilisation_indice",
              exerciceId: signal.exerciceId ?? "",
            },
          };
        case "abandon":
          return {
            ...base,
            type: "abandon",
            preuve: {
              type: "abandon",
              exerciceId: signal.exerciceId,
              dureeMs: signal.dureeMs,
            },
          };
        case "temps_reflexion":
          return {
            ...base,
            type: "temps_reflexion",
            preuve: {
              type: "temps_reflexion",
              dureeMs: signal.dureeMs ?? 0,
              exerciceId: signal.exerciceId,
              questionId: signal.questionId,
            },
          };
        case "confiance_declaree":
          return {
            ...base,
            type: "confiance_declaree",
            preuve: {
              type: "confiance_declaree",
              confiance: signal.confiance ?? 0.5,
              exerciceId: signal.exerciceId,
            },
          };
        case "preference_format":
          return {
            ...base,
            type: "preference_format",
            preuve: {
              type: "preference_format",
              format: signal.format ?? "inconnu",
              succes: signal.succes ?? true,
            },
          };
        case "revision":
          return {
            ...base,
            type: "revision",
            preuve: {
              type: "revision",
              succes: signal.succes ?? false,
            },
          };
        case "oubli_detecte":
          return {
            ...base,
            type: "oubli_detecte",
            preuve: {
              type: "oubli_detecte",
              intensite: signal.intensite ?? 0.5,
            },
          };
      }
    },
  };
}
