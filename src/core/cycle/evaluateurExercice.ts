import type {
  AnalyseReponse,
  Exercice,
  FeedbackItem,
  ReponseApprenant,
} from "@/core/domain";
import { formatExerciceEstFerme } from "@/core/domain";

export interface ResultatEvaluationExercice {
  readonly analyse: AnalyseReponse;
  readonly items: readonly FeedbackItem[];
}

/** Normalise une réponse libre pour comparaison (casse, accents, espaces). */
export function normaliserReponseTexte(valeur: string): string {
  return valeur
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ");
}

function reponseCorrespond(obtenu: string, solutions: readonly string[]): boolean {
  const cible = normaliserReponseTexte(obtenu);
  if (!cible) {
    return false;
  }
  return solutions.some((s) => normaliserReponseTexte(s) === cible);
}

function evaluerQcm(
  exercice: Extract<Exercice, { format: "qcm" }>,
  reponse: Extract<ReponseApprenant, { format: "qcm" }>,
): ResultatEvaluationExercice {
  const correct = reponse.indexChoisi === exercice.bonneReponse;
  const items: FeedbackItem[] = [
    {
      id: "choix",
      correct,
      attendu: exercice.options[exercice.bonneReponse],
      obtenu: exercice.options[reponse.indexChoisi] ?? `(index ${reponse.indexChoisi})`,
    },
  ];
  return {
    items,
    analyse: {
      correcte: correct,
      pourquoi: correct
        ? "Bonne réponse au QCM."
        : "L'option choisie n'est pas la bonne réponse.",
      ...(correct
        ? {}
        : { connaissanceManquante: "réponse attendue au QCM non maîtrisée" }),
    },
  };
}

function evaluerTrous(
  exercice: Extract<Exercice, { format: "trous" }>,
  reponse: Extract<ReponseApprenant, { format: "trous" }>,
): ResultatEvaluationExercice {
  const items: FeedbackItem[] = exercice.phrases.map((phrase) => {
    const saisi = reponse.remplissages[phrase.id]?.[0] ?? "";
    const correct = reponseCorrespond(saisi, phrase.solutions);
    return {
      id: phrase.id,
      correct,
      attendu: phrase.solutions[0],
      obtenu: saisi || "(vide)",
    };
  });
  const correcte = items.every((i) => i.correct);
  return {
    items,
    analyse: {
      correcte,
      pourquoi: correcte
        ? "Tous les trous sont correctement remplis."
        : "Au moins un trou est incorrect ou incomplet.",
      ...(correcte
        ? {}
        : { connaissanceManquante: "éléments manquants dans les phrases à trous" }),
    },
  };
}

function evaluerAppariement(
  exercice: Extract<Exercice, { format: "appariement" }>,
  reponse: Extract<ReponseApprenant, { format: "appariement" }>,
): ResultatEvaluationExercice {
  const items: FeedbackItem[] = exercice.paires.map((paire) => {
    const obtenu = reponse.associations[paire.id] ?? "";
    const correct =
      normaliserReponseTexte(obtenu) === normaliserReponseTexte(paire.droite);
    return {
      id: paire.id,
      correct,
      attendu: paire.droite,
      obtenu: obtenu || "(non associé)",
      commentaire: paire.gauche,
    };
  });
  const correcte = items.every((i) => i.correct);
  return {
    items,
    analyse: {
      correcte,
      pourquoi: correcte
        ? "Toutes les associations sont correctes."
        : "Au moins une association est incorrecte.",
      ...(correcte
        ? {}
        : { connaissanceManquante: "correspondances non maîtrisées" }),
    },
  };
}

/**
 * Évalue un exercice à format fermé de façon déterministe.
 * Pour `production_libre`, lever une erreur — utiliser l'analyseur IA.
 */
export function evaluerExercice(
  exercice: Exercice,
  reponse: ReponseApprenant,
): ResultatEvaluationExercice {
  if (!formatExerciceEstFerme(exercice.format)) {
    throw new Error(
      "evaluerExercice ne s'applique qu'aux formats fermés (qcm, trous, appariement)",
    );
  }
  if (reponse.format !== exercice.format) {
    throw new Error(
      `Format de réponse « ${reponse.format} » incompatible avec l'exercice « ${exercice.format} »`,
    );
  }

  switch (exercice.format) {
    case "qcm":
      return evaluerQcm(exercice, reponse as Extract<ReponseApprenant, { format: "qcm" }>);
    case "trous":
      return evaluerTrous(
        exercice,
        reponse as Extract<ReponseApprenant, { format: "trous" }>,
      );
    case "appariement":
      return evaluerAppariement(
        exercice,
        reponse as Extract<ReponseApprenant, { format: "appariement" }>,
      );
  }
}
