import type {
  Adaptation,
  AnalyseurErreurs,
  Correcteur,
  Diagnostic,
  GenerateurDeContenu,
  GenerateurExercices,
  PlanificationPedagogique,
  Remediation,
} from "@/core/ports";
import { traceIdCourant } from "./contexteTrace";
import { journalCapacite } from "./journal";

interface CapacitesTracees {
  diagnostic: Diagnostic;
  planification: PlanificationPedagogique;
  generateurContenu: GenerateurDeContenu;
  generateurExercices: GenerateurExercices;
  analyseurErreurs: AnalyseurErreurs;
  correcteur: Correcteur;
  remediation: Remediation;
  adaptation: Adaptation;
}

async function tracerAppel<T>(
  nom: string,
  fn: () => Promise<T>,
): Promise<T> {
  const debut = performance.now();
  const traceId = traceIdCourant();

  try {
    const resultat = await fn();
    journalCapacite(nom, Math.round(performance.now() - debut), traceId);
    return resultat;
  } catch (erreur) {
    journalCapacite(nom, Math.round(performance.now() - debut), traceId, erreur);
    throw erreur;
  }
}

/** Enveloppe les 8 capacités IA pour tracer chaque appel dans le terminal. */
export function tracerCapacites<T extends CapacitesTracees>(capacites: T): T {
  return {
    ...capacites,
    diagnostic: {
      genererQuestion: (contexte, params) =>
        tracerAppel("diagnostic.genererQuestion", () =>
          capacites.diagnostic.genererQuestion(contexte, params),
        ),
      evaluerReponse: (contexte, question, reponse) =>
        tracerAppel("diagnostic.evaluerReponse", () =>
          capacites.diagnostic.evaluerReponse(contexte, question, reponse),
        ),
      construireProfil: (contexte) =>
        tracerAppel("diagnostic.construireProfil", () =>
          capacites.diagnostic.construireProfil(contexte),
        ),
    },
    planification: {
      genererRoadmap: (contexte) =>
        tracerAppel("planification.genererRoadmap", () =>
          capacites.planification.genererRoadmap(contexte),
        ),
    },
    generateurContenu: {
      genererProblematique: (contexte, notion) =>
        tracerAppel("generateurContenu.genererProblematique", () =>
          capacites.generateurContenu.genererProblematique(contexte, notion),
        ),
      genererCours: (contexte, notion) =>
        tracerAppel("generateurContenu.genererCours", () =>
          capacites.generateurContenu.genererCours(contexte, notion),
        ),
      genererExempleExpert: (contexte, notion) =>
        tracerAppel("generateurContenu.genererExempleExpert", () =>
          capacites.generateurContenu.genererExempleExpert(contexte, notion),
        ),
    },
    generateurExercices: {
      genererExercice: (contexte, notion, guidage) =>
        tracerAppel("generateurExercices.genererExercice", () =>
          capacites.generateurExercices.genererExercice(contexte, notion, guidage),
        ),
    },
    analyseurErreurs: {
      analyser: (contexte, exercice, reponse) =>
        tracerAppel("analyseurErreurs.analyser", () =>
          capacites.analyseurErreurs.analyser(contexte, exercice, reponse),
        ),
    },
    correcteur: {
      corriger: (contexte, exercice, analyse) =>
        tracerAppel("correcteur.corriger", () =>
          capacites.correcteur.corriger(contexte, exercice, analyse),
        ),
    },
    remediation: {
      genererExerciceCible: (contexte, notion, lacune) =>
        tracerAppel("remediation.genererExerciceCible", () =>
          capacites.remediation.genererExerciceCible(contexte, notion, lacune),
        ),
    },
    adaptation: {
      adapter: (contexte) =>
        tracerAppel("adaptation.adapter", () =>
          capacites.adaptation.adapter(contexte),
        ),
    },
  };
}
