export type PhaseAttente =
  | "demarrageDiagnostic"
  | "questionDiagnostic"
  | "constructionParcours"
  | "generationCours"
  | "generationExemple"
  | "generationExercice"
  | "correctionExercice"
  | "notionSuivante"
  | "transcription";

export interface ConfigPhaseAttente {
  titre: string;
  etapes: readonly string[];
}

export const PHASES_ATTENTE: Record<PhaseAttente, ConfigPhaseAttente> = {
  demarrageDiagnostic: {
    titre: "Lancement du parcours",
    etapes: [
      "J'analyse ton objectif…",
      "Je prépare la première question de diagnostic…",
    ],
  },
  questionDiagnostic: {
    titre: "Diagnostic",
    etapes: [
      "J'analyse ta réponse…",
      "Je prépare la question suivante…",
    ],
  },
  constructionParcours: {
    titre: "Préparation de ton parcours",
    etapes: [
      "Je construis ton profil à partir de tes réponses…",
      "Je dessine ton programme sur mesure…",
      "Je lance la première notion…",
    ],
  },
  generationCours: {
    titre: "Ton cours",
    etapes: [
      "Je structure ton cours…",
      "Je prépare les schémas et illustrations…",
    ],
  },
  generationExemple: {
    titre: "Exemple d'expert",
    etapes: [
      "Je choisis un cas concret…",
      "J'enrichis l'exemple avec des visuels…",
    ],
  },
  generationExercice: {
    titre: "Exercice",
    etapes: [
      "Je rédige un exercice adapté à ton niveau…",
      "Je finalise l'énoncé…",
    ],
  },
  correctionExercice: {
    titre: "Correction",
    etapes: [
      "J'analyse ta réponse…",
      "Je prépare ton feedback…",
      "J'ajuste ton parcours si besoin…",
    ],
  },
  notionSuivante: {
    titre: "Notion suivante",
    etapes: [
      "Je passe à la notion suivante…",
      "Je prépare le point de départ…",
    ],
  },
  transcription: {
    titre: "Dictée",
    etapes: ["Mise en texte de ta voix…"],
  },
};

/** Phase d'attente lors d'un clic « Continuer » selon le contenu affiché. */
export function phasePourAvancerCycle(
  typeContenu: "problematique" | "cours" | "exempleExpert",
): PhaseAttente {
  switch (typeContenu) {
    case "problematique":
      return "generationCours";
    case "cours":
      return "generationExemple";
    case "exempleExpert":
      return "generationExercice";
  }
}
