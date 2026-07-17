import type {
  AnalyseReponse,
  Correction,
  Cours,
  ExempleExpert,
  Exercice,
  IntentionBloc,
  PlanCours,
  Problematique,
  ProfilApprenant,
  QuestionDiagnostic,
} from "@/core/domain";
import type {
  Adaptation,
  AnalyseurErreurs,
  Correcteur,
  Diagnostic,
  GenerateurDeContenu,
  GenerateurExercices,
  GenerateurGraphique,
  GenerateurSchema,
  ParametresQuestionDiagnostic,
  PlanificateurCours,
  PlanificationPedagogique,
  Remediation,
  ResultatAdaptation,
} from "@/core/ports";
import { generateText, type LanguageModel, Output } from "ai";
import type { z } from "zod";
import { traceIdCourant } from "@/adapters/logging/contexteTrace";
import { journalIA } from "@/adapters/logging/journal";
import { choisirMeilleurPlan, evaluerQualitePlan } from "@/core/cours/qualiteCours";
import { construireRoadmapDepuisGeneration, notionsPreMaitriseesDepuisGeneration } from "./construireRoadmap";
import {
  assurerIntentionsExempleExpert,
  filtrerIntentionsExempleExpert,
} from "./filtrerIntentionsExempleExpert";
import {
  normaliserAnalyse,
  normaliserExercice,
  normaliserIntention,
  normaliserSpecGraphique,
} from "./normaliser";
import {
  promptAdaptation,
  promptAnalyserReponse,
  promptConstruireProfil,
  promptCorriger,
  promptEvaluerReponseDiagnostic,
  promptGenererExempleExpert,
  promptGenererExercice,
  promptGenererGraphique,
  promptGenererPlanCours,
  promptGenererProblematique,
  promptGenererRoadmap,
  promptGenererSchema,
  promptReparerPlanCours,
  promptQuestionDiagnostic,
  promptRemediation,
  promptSysteme,
} from "./prompts";
import {
  schemaAnalyseReponse,
  schemaCorrectionSansIds,
  schemaEvaluationDiagnostic,
  schemaExempleExpertSansNotionId,
  schemaExerciceSansIds,
  schemaMermaid,
  schemaPlanCours,
  schemaProblematiqueSansNotionId,
  schemaProfilSansIds,
  schemaQuestionDiagnosticGeneree,
  schemaResultatAdaptationSansIds,
  schemaRoadmapSansIds,
  schemaSpecGraphique,
} from "./schemas";

/** Plan d'exemple expert avant enrichissement média (schéma/graphique/image). */
export interface PlanExempleExpert {
  readonly contexte: string;
  readonly intentions: readonly IntentionBloc[];
}

function idModele(modele: LanguageModel): string {
  if (typeof modele === "string") return modele;
  return modele.modelId ?? "inconnu";
}

function estModeleOpenAI(modele: LanguageModel): boolean {
  if (typeof modele === "string") {
    return modele.startsWith("gpt-") || modele.startsWith("o");
  }
  const id = modele.modelId ?? "";
  const provider = "provider" in modele ? String(modele.provider ?? "") : "";
  return provider.includes("openai") || id.startsWith("gpt-") || id.startsWith("o");
}

type VerbosityOpenAI = "low" | "medium" | "high";

interface OptionsGenererStructure {
  textVerbosity?: VerbosityOpenAI;
}

function planDepuisGeneration(genere: z.infer<typeof schemaPlanCours>): PlanCours {
  return {
    titre: genere.titre,
    intentions: genere.intentions.map(normaliserIntention),
  };
}

async function genererStructure<T>(
  modele: LanguageModel,
  schema: z.ZodType<T>,
  prompt: string,
  etiquette: string,
  options?: OptionsGenererStructure,
): Promise<T> {
  const debut = performance.now();
  const traceId = traceIdCourant();
  const nomModele = idModele(modele);
  const textVerbosity = options?.textVerbosity ?? "low";

  try {
    const resultat = await generateText({
      model: modele,
      system: promptSysteme(),
      prompt,
      output: Output.object({ schema }),
      ...(estModeleOpenAI(modele)
        ? {
            providerOptions: {
              openai: {
                reasoningEffort: "minimal" as const,
                textVerbosity,
              },
            },
          }
        : {}),
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

function journaliserRejetIntentionExempleExpert(intention: IntentionBloc): void {
  console.warn(
    `[exempleExpert] Intention rejetée (type "${intention.type}" hors contrat)`,
  );
}

function intentionsExempleExpertApresFiltrage(
  intentions: readonly IntentionBloc[],
  notion: import("@/core/domain").Notion,
): IntentionBloc[] {
  return assurerIntentionsExempleExpert(intentions, notion, {
    onRejet: journaliserRejetIntentionExempleExpert,
  });
}

function intentionsSansMedia(
  intentions: readonly IntentionBloc[],
): ExempleExpert["demonstration"] {
  return intentions
    .filter(
      (intention) =>
        intention.type !== "schema" &&
        intention.type !== "graphique" &&
        intention.type !== "image",
    )
    .map((intention) => {
      switch (intention.type) {
        case "texte":
        case "encadre":
        case "analogie":
        case "comparaison":
        case "tableau":
        case "etapes":
        case "quizFlash":
          return intention;
        default:
          return { type: "texte" as const, markdown: "_Bloc média non enrichi._" };
      }
    });
}

/** Implémentation des capacités IA texte via génération structurée. */
export function creerCapacitesIA(modele: LanguageModel): {
  diagnostic: Diagnostic;
  planification: PlanificationPedagogique;
  planificateurCours: PlanificateurCours;
  /** Plan brut d'exemple expert — à enrichir via ConcepteurDeCours. */
  planifierExempleExpert: (
    contexte: import("@/core/domain").ContexteApprentissage,
    notion: import("@/core/domain").Notion,
  ) => Promise<PlanExempleExpert>;
  generateurContenu: GenerateurDeContenu;
  generateurSchema: GenerateurSchema;
  generateurGraphique: GenerateurGraphique;
  generateurExercices: GenerateurExercices;
  analyseurErreurs: AnalyseurErreurs;
  correcteur: Correcteur;
  remediation: Remediation;
  adaptation: Adaptation;
} {
  const diagnostic: Diagnostic = {
    async genererQuestion(
      contexte,
      params: ParametresQuestionDiagnostic,
    ): Promise<QuestionDiagnostic> {
      const generee = await genererStructure(
        modele,
        schemaQuestionDiagnosticGeneree,
        promptQuestionDiagnostic(contexte, {
          difficulteCible: params.difficulteCible,
          competencesDejaCouvertes: params.competencesDejaCouvertes,
        }),
        "questionDiagnostic",
      );
      return {
        id: crypto.randomUUID(),
        intitule: generee.intitule,
        competenceId: generee.competenceId,
        competenceLibelle: generee.competenceLibelle,
        difficulte: generee.difficulte as QuestionDiagnostic["difficulte"],
      };
    },

    async evaluerReponse(contexte, question, reponse): Promise<import("@/core/domain").EvaluationDiagnostic> {
      const generee = await genererStructure(
        modele,
        schemaEvaluationDiagnostic,
        promptEvaluerReponseDiagnostic(contexte, question, reponse),
        "evaluationDiagnostic",
      );
      return {
        questionId: question.id,
        maitrise: generee.maitrise,
        justification: generee.justification,
        lacuneDetectee: generee.lacuneDetectee ?? undefined,
      };
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
        acquis: genere.acquis,
        competences: genere.competences,
        lacunes: genere.lacunes,
        erreursFrequentes: genere.erreursFrequentes,
        preferencesPedagogiques: genere.preferencesPedagogiques,
        notionsMaitrisees: [],
        niveauEstime: contexte.estimationNiveau?.scoreGlobal ?? null,
        miseAJour: new Date().toISOString(),
      };
    },
  };

  const planification: PlanificationPedagogique = {
    async genererRoadmap(contexte) {
      const generee = await genererStructure(
        modele,
        schemaRoadmapSansIds,
        promptGenererRoadmap(contexte),
        "roadmap",
      );
      const roadmap = construireRoadmapDepuisGeneration(
        contexte.objectif.id,
        1,
        generee,
      );
      return {
        roadmap,
        notionsPreMaitrisees: notionsPreMaitriseesDepuisGeneration(generee, roadmap),
      };
    },
  };

  const planificateurCours: PlanificateurCours = {
    async genererPlanCours(contexte, notion): Promise<PlanCours> {
      const genereInitial = await genererStructure(
        modele,
        schemaPlanCours,
        promptGenererPlanCours(contexte, notion),
        "planCours",
        { textVerbosity: "high" },
      );
      let plan = planDepuisGeneration(genereInitial);
      let evaluation = evaluerQualitePlan(plan);

      if (!evaluation.valide) {
        const genereReparation = await genererStructure(
          modele,
          schemaPlanCours,
          promptReparerPlanCours(contexte, notion, evaluation.defauts, {
            titre: plan.titre,
            intentions: genereInitial.intentions,
          }),
          "planCoursReparation",
          { textVerbosity: "high" },
        );
        const planRepare = planDepuisGeneration(genereReparation);
        const evaluationRepare = evaluerQualitePlan(planRepare);
        plan = choisirMeilleurPlan(plan, planRepare);
        evaluation = plan === planRepare ? evaluationRepare : evaluation;
        if (!evaluation.valide) {
          console.warn(
            `[planCours] Qualité sous le seuil après retry : ${evaluation.defauts.join(" | ")}`,
          );
        }
      }

      return plan;
    },
  };

  async function genererMermaidAvecRetry(brief: string, contexte?: string) {
    const tenter = async (etiquette: string) => {
      const genere = await genererStructure(
        modele,
        schemaMermaid,
        promptGenererSchema(brief, contexte),
        etiquette,
      );
      const mermaid = genere.mermaid?.trim() ?? "";
      if (mermaid.length < 12) {
        throw new Error("Code Mermaid trop court ou vide.");
      }
      return { mermaid };
    };
    try {
      return await tenter("schema");
    } catch {
      return await tenter("schemaRetry");
    }
  }

  const generateurSchema: GenerateurSchema = {
    async genererSchema({ brief, contexte }) {
      return genererMermaidAvecRetry(brief, contexte);
    },
  };

  const generateurGraphique: GenerateurGraphique = {
    async genererGraphique({ brief, contexte }) {
      const genere = await genererStructure(
        modele,
        schemaSpecGraphique,
        promptGenererGraphique(brief, contexte),
        "graphique",
      );
      return normaliserSpecGraphique(genere);
    },
  };

  async function planifierExempleExpert(
    contexte: import("@/core/domain").ContexteApprentissage,
    notion: import("@/core/domain").Notion,
  ): Promise<PlanExempleExpert> {
    const genere = await genererStructure(
      modele,
      schemaExempleExpertSansNotionId,
      promptGenererExempleExpert(contexte, notion),
      "exempleExpert",
    );
    const normalisees = genere.intentions.map(normaliserIntention);
    return {
      contexte: genere.contexte,
      intentions: intentionsExempleExpertApresFiltrage(normalisees, notion),
    };
  }

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

    /**
     * Fallback sans enrichissement média.
     * Le moteur doit préférer `concepteurDeCours.composerCours`.
     */
    async genererCours(contexte, notion): Promise<Cours> {
      const plan = await planificateurCours.genererPlanCours(contexte, notion);
      return {
        notionId: notion.id,
        titre: plan.titre,
        blocs: intentionsSansMedia(plan.intentions),
      };
    },

    /**
     * Fallback sans enrichissement média.
     * Le moteur doit préférer planifierExempleExpert + enrichirIntentions.
     */
    async genererExempleExpert(contexte, notion): Promise<ExempleExpert> {
      const plan = await planifierExempleExpert(contexte, notion);
      const filtrees = filtrerIntentionsExempleExpert(plan.intentions, {
        onRejet: journaliserRejetIntentionExempleExpert,
      });
      return {
        notionId: notion.id,
        contexte: plan.contexte,
        demonstration: intentionsSansMedia(
          filtrees.length >= 1 ? filtrees : plan.intentions,
        ),
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
      const roadmap = construireRoadmapDepuisGeneration(
        contexte.objectif.id,
        version,
        genere.roadmap,
        contexte.roadmap,
      );

      // Source de vérité : les IDs déjà maîtrisés côté orchestrateur.
      // On ignore les notionsMaitrisees renvoyées par le LLM (titres ou IDs inventés).
      const idsValides = new Set(roadmap.notions.map((n) => n.id));
      const notionsMaitrisees = contexte.profil.notionsMaitrisees.filter((id) =>
        idsValides.has(id),
      );

      return {
        profil: {
          objectifId: contexte.objectif.id,
          acquis: genere.profil.acquis,
          competences: genere.profil.competences,
          lacunes: genere.profil.lacunes,
          erreursFrequentes: genere.profil.erreursFrequentes,
          preferencesPedagogiques: genere.profil.preferencesPedagogiques,
          notionsMaitrisees,
          niveauEstime: contexte.profil.niveauEstime,
          miseAJour: new Date().toISOString(),
        },
        roadmap,
      };
    },
  };

  return {
    diagnostic,
    planification,
    planificateurCours,
    planifierExempleExpert,
    generateurContenu,
    generateurSchema,
    generateurGraphique,
    generateurExercices,
    analyseurErreurs,
    correcteur,
    remediation,
    adaptation,
  };
}
