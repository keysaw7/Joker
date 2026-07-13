import type {
  AnalyseReponse,
  ContexteApprentissage,
  Correction,
  Cours,
  ExempleExpert,
  Exercice,
  NiveauGuidage,
  Notion,
  Problematique,
  ProfilApprenant,
  QuestionDiagnostic,
  ReponseApprenant,
  Roadmap,
} from "@/core/domain";
import type {
  Adaptation,
  AnalyseurErreurs,
  Correcteur,
  Diagnostic,
  GenerateurDeContenu,
  GenerateurExercices,
  PlanificationPedagogique,
  Remediation,
  ResultatAdaptation,
} from "@/core/ports";
import { generateText, type LanguageModel, Output } from "ai";
import type { z } from "zod";
import { traceIdCourant } from "@/adapters/logging/contexteTrace";
import { journalIA } from "@/adapters/logging/journal";
import { construireRoadmapDepuisGeneration } from "./construireRoadmap";
import {
  normaliserAnalyse,
  normaliserBloc,
  normaliserExercice,
} from "./normaliser";
import {
  promptAdaptation,
  promptAnalyserReponse,
  promptConstruireProfil,
  promptCorriger,
  promptGenererCours,
  promptGenererExempleExpert,
  promptGenererExercice,
  promptGenererProblematique,
  promptGenererRoadmap,
  promptQuestionDiagnostic,
  promptRemediation,
  promptSysteme,
} from "./prompts";
import {
  schemaAnalyseReponse,
  schemaCorrectionSansIds,
  schemaCoursSansNotionId,
  schemaExempleExpertSansNotionId,
  schemaExerciceSansIds,
  schemaProblematiqueSansNotionId,
  schemaProfilSansIds,
  schemaQuestionDiagnostic,
  schemaResultatAdaptationSansIds,
  schemaRoadmapSansIds,
} from "./schemas";

const SEUIL_QUESTIONS_DIAGNOSTIC = 4;

function idModele(modele: LanguageModel): string {
  if (typeof modele === "string") return modele;
  return modele.modelId ?? "inconnu";
}

async function genererStructure<T>(
  modele: LanguageModel,
  schema: z.ZodType<T>,
  prompt: string,
  etiquette: string,
): Promise<T> {
  const debut = performance.now();
  const traceId = traceIdCourant();
  const nomModele = idModele(modele);

  try {
    const resultat = await generateText({
      model: modele,
      system: promptSysteme(),
      prompt,
      output: Output.object({ schema }),
      providerOptions: {
        openai: {
          reasoningEffort: "minimal",
          textVerbosity: "low",
        },
      },
    });

    const dureeMs = Math.round(performance.now() - debut);

    if (resultat.output == null) {
      const erreur = new Error("Le modèle n'a pas généré de réponse structurée.");
      journalIA(nomModele, etiquette, dureeMs, undefined, traceId, erreur);
      throw erreur;
    }

    journalIA(
      nomModele,
      etiquette,
      dureeMs,
      {
        inputTokens: resultat.usage?.inputTokens,
        outputTokens: resultat.usage?.outputTokens,
      },
      traceId,
    );

    return resultat.output;
  } catch (erreur) {
    journalIA(
      nomModele,
      etiquette,
      Math.round(performance.now() - debut),
      undefined,
      traceId,
      erreur,
    );
    throw erreur;
  }
}

/** Implémentation des 8 capacités IA via génération structurée. */
export function creerCapacitesIA(modele: LanguageModel): {
  diagnostic: Diagnostic;
  planification: PlanificationPedagogique;
  generateurContenu: GenerateurDeContenu;
  generateurExercices: GenerateurExercices;
  analyseurErreurs: AnalyseurErreurs;
  correcteur: Correcteur;
  remediation: Remediation;
  adaptation: Adaptation;
} {
  const diagnostic: Diagnostic = {
    async genererQuestion(contexte): Promise<QuestionDiagnostic> {
      const generee = await genererStructure(
        modele,
        schemaQuestionDiagnostic,
        promptQuestionDiagnostic(contexte),
        "questionDiagnostic",
      );
      return { id: crypto.randomUUID(), intitule: generee.intitule };
    },

    async estTermine(contexte): Promise<boolean> {
      return contexte.reponsesDiagnostic.length >= SEUIL_QUESTIONS_DIAGNOSTIC;
    },

    async construireProfil(contexte): Promise<ProfilApprenant> {
      const genere = await genererStructure(
        modele,
        schemaProfilSansIds,
        promptConstruireProfil(contexte),
        "profil",
      );
      return {
        objectifId: contexte.objectif.id,
        ...genere,
        miseAJour: new Date().toISOString(),
      };
    },
  };

  const planification: PlanificationPedagogique = {
    async genererRoadmap(contexte): Promise<Roadmap> {
      const generee = await genererStructure(
        modele,
        schemaRoadmapSansIds,
        promptGenererRoadmap(contexte),
        "roadmap",
      );
      return construireRoadmapDepuisGeneration(
        contexte.objectif.id,
        1,
        generee,
      );
    },
  };

  const generateurContenu: GenerateurDeContenu = {
    async genererProblematique(contexte, notion): Promise<Problematique> {
      const generee = await genererStructure(
        modele,
        schemaProblematiqueSansNotionId,
        promptGenererProblematique(contexte, notion),
        "problematique",
      );
      return { notionId: notion.id, ...generee };
    },

    async genererCours(contexte, notion): Promise<Cours> {
      const genere = await genererStructure(
        modele,
        schemaCoursSansNotionId,
        promptGenererCours(contexte, notion),
        "cours",
      );
      return {
        notionId: notion.id,
        titre: genere.titre,
        blocs: genere.blocs.map(normaliserBloc),
      };
    },

    async genererExempleExpert(contexte, notion): Promise<ExempleExpert> {
      const genere = await genererStructure(
        modele,
        schemaExempleExpertSansNotionId,
        promptGenererExempleExpert(contexte, notion),
        "exempleExpert",
      );
      return {
        notionId: notion.id,
        contexte: genere.contexte,
        demonstration: genere.demonstration.map(normaliserBloc),
      };
    },
  };

  const generateurExercices: GenerateurExercices = {
    async genererExercice(contexte, notion, guidage): Promise<Exercice> {
      const genere = await genererStructure(
        modele,
        schemaExerciceSansIds,
        promptGenererExercice(contexte, notion, guidage),
        "exercice",
      );
      return normaliserExercice(genere, {
        id: crypto.randomUUID(),
        notionId: notion.id,
      });
    },
  };

  const analyseurErreurs: AnalyseurErreurs = {
    async analyser(contexte, exercice, reponse): Promise<AnalyseReponse> {
      return normaliserAnalyse(
        await genererStructure(
          modele,
          schemaAnalyseReponse,
          promptAnalyserReponse(contexte, exercice, reponse),
          "analyseReponse",
        ),
      );
    },
  };

  const correcteur: Correcteur = {
    async corriger(contexte, exercice, analyse): Promise<Correction> {
      const genere = await genererStructure(
        modele,
        schemaCorrectionSansIds,
        promptCorriger(contexte, exercice, JSON.stringify(analyse, null, 2)),
        "correction",
      );
      return {
        exerciceId: exercice.id,
        analyse,
        explicationPersonnalisee: genere.explicationPersonnalisee,
      };
    },
  };

  const remediation: Remediation = {
    async genererExerciceCible(contexte, notion, lacune): Promise<Exercice> {
      const genere = await genererStructure(
        modele,
        schemaExerciceSansIds,
        promptRemediation(contexte, notion, lacune),
        "remediation",
      );
      return {
        id: crypto.randomUUID(),
        notionId: notion.id,
        guidage: "fort",
        cibleLacune: lacune,
        enonce: genere.enonce,
      };
    },
  };

  const adaptation: Adaptation = {
    async adapter(contexte): Promise<ResultatAdaptation> {
      const genere = await genererStructure(
        modele,
        schemaResultatAdaptationSansIds,
        promptAdaptation(contexte),
        "adaptation",
      );

      const version = (contexte.roadmap?.version ?? 0) + 1;

      return {
        profil: {
          objectifId: contexte.objectif.id,
          ...genere.profil,
          miseAJour: new Date().toISOString(),
        },
        roadmap: construireRoadmapDepuisGeneration(
          contexte.objectif.id,
          version,
          genere.roadmap,
        ),
      };
    },
  };

  return {
    diagnostic,
    planification,
    generateurContenu,
    generateurExercices,
    analyseurErreurs,
    correcteur,
    remediation,
    adaptation,
  };
}
