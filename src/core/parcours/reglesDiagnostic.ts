import type {
  ContexteApprentissage,
  DifficulteDiagnostic,
  EntreeHistoriqueDiagnostic,
  EstimationNiveau,
  EvaluationDiagnostic,
  MaitriseDiagnostic,
  NiveauGuidage,
  ProfilApprenant,
  QuestionDiagnostic,
} from "@/core/domain";

export const MIN_QUESTIONS = 3;
export const MAX_QUESTIONS = 8;
export const DIFFICULTE_INITIALE: DifficulteDiagnostic = 3;
export const SEUIL_CONFIANCE = 0.75;

export function estimationInitiale(): EstimationNiveau {
  return {
    scoreGlobal: 0,
    competences: [],
    confiance: 0,
    evaluations: [],
  };
}

function bornerDifficulte(valeur: number): DifficulteDiagnostic {
  const arrondi = Math.round(valeur);
  if (arrondi <= 1) return 1;
  if (arrondi >= 5) return 5;
  return arrondi as DifficulteDiagnostic;
}

export function prochaineDifficulte(
  actuelle: DifficulteDiagnostic,
  maitrise: MaitriseDiagnostic,
): DifficulteDiagnostic {
  if (maitrise === "maitrise") {
    return bornerDifficulte(actuelle + 1);
  }
  if (maitrise === "absent") {
    return bornerDifficulte(actuelle - 1);
  }
  return actuelle;
}

function scorePourEvaluation(
  maitrise: MaitriseDiagnostic,
  difficulte: DifficulteDiagnostic,
): number {
  const facteur =
    maitrise === "maitrise" ? 1 : maitrise === "partiel" ? 0.55 : 0;
  return Math.round(facteur * (difficulte / 5) * 100);
}

function mettreAJourCompetence(
  competences: readonly import("@/core/domain").CompetenceEstimee[],
  question: QuestionDiagnostic,
  evaluation: EvaluationDiagnostic,
): import("@/core/domain").CompetenceEstimee[] {
  const scoreItem = scorePourEvaluation(evaluation.maitrise, question.difficulte);
  const existante = competences.find((c) => c.competenceId === question.competenceId);
  if (!existante) {
    return [
      ...competences,
      {
        competenceId: question.competenceId,
        libelle: question.competenceLibelle,
        score: scoreItem,
      },
    ];
  }
  const nouveauScore = Math.round((existante.score + scoreItem) / 2);
  return competences.map((c) =>
    c.competenceId === question.competenceId
      ? { ...c, score: nouveauScore }
      : c,
  );
}

function calculerConfiance(
  evaluations: readonly EvaluationDiagnostic[],
  historique: readonly EntreeHistoriqueDiagnostic[],
): number {
  const n = evaluations.length;
  if (n === 0) return 0;

  let confiance = Math.min(1, n / MAX_QUESTIONS);

  if (n >= MIN_QUESTIONS) {
    confiance = Math.max(confiance, 0.5 + (n - MIN_QUESTIONS) / (MAX_QUESTIONS - MIN_QUESTIONS) * 0.35);
  }

  if (plafondConfirme(historique) || plancherConfirme(historique)) {
    confiance = Math.min(1, confiance + 0.2);
  }

  return Math.round(confiance * 100) / 100;
}

function plafondConfirme(historique: readonly EntreeHistoriqueDiagnostic[]): boolean {
  const fin = historique.slice(-2);
  return (
    fin.length === 2 &&
    fin.every((e) => e.difficulte >= 4 && e.maitrise === "maitrise")
  );
}

function plancherConfirme(historique: readonly EntreeHistoriqueDiagnostic[]): boolean {
  const fin = historique.slice(-2);
  return (
    fin.length === 2 &&
    fin.every((e) => e.difficulte <= 2 && e.maitrise === "absent")
  );
}

export function mettreAJourEstimation(
  estimation: EstimationNiveau,
  question: QuestionDiagnostic,
  evaluation: EvaluationDiagnostic,
  historique: readonly EntreeHistoriqueDiagnostic[],
): EstimationNiveau {
  const evaluations = [...estimation.evaluations, evaluation];
  const competences = mettreAJourCompetence(estimation.competences, question, evaluation);
  const scoreGlobal =
    competences.length === 0
      ? 0
      : Math.round(
          competences.reduce((acc, c) => acc + c.score, 0) / competences.length,
        );
  const confiance = calculerConfiance(evaluations, historique);

  return {
    scoreGlobal,
    competences,
    confiance,
    evaluations,
  };
}

/** Seuil d'incertitude globale sous lequel le diagnostic peut s'arrêter. */
export const SEUIL_INCERTITUDE_DIAGNOSTIC = 0.35;

export function diagnosticEstTermine(
  nbPosees: number,
  estimation: EstimationNiveau,
  historique: readonly EntreeHistoriqueDiagnostic[],
  incertitudeGlobale?: number,
): boolean {
  if (nbPosees >= MAX_QUESTIONS) {
    return true;
  }
  if (nbPosees < MIN_QUESTIONS) {
    return false;
  }
  if (
    incertitudeGlobale !== undefined &&
    incertitudeGlobale <= SEUIL_INCERTITUDE_DIAGNOSTIC
  ) {
    return true;
  }
  if (estimation.confiance >= SEUIL_CONFIANCE) {
    return true;
  }
  if (plafondConfirme(historique) || plancherConfirme(historique)) {
    return true;
  }
  return false;
}

export function guidageInitialDepuisScore(score: number): NiveauGuidage {
  if (score >= 70) {
    return "autonome";
  }
  if (score >= 40) {
    return "modere";
  }
  return "fort";
}

export function appliquerMaitriseInitiale(
  profil: ProfilApprenant,
  notionsPreMaitrisees: readonly string[],
): ProfilApprenant {
  const fusion = new Set([...profil.notionsMaitrisees, ...notionsPreMaitrisees]);
  return {
    ...profil,
    notionsMaitrisees: [...fusion],
    miseAJour: new Date().toISOString(),
  };
}

export function competencesCouvertes(
  contexte: ContexteApprentissage,
): readonly string[] {
  if (!contexte.estimationNiveau) {
    return [];
  }
  return contexte.estimationNiveau.competences.map((c) => c.competenceId);
}
