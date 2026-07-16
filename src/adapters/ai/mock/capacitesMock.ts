import { creerConcepteurDeCours } from "@/core/cours/concepteurDeCours";
import type {
  AnalyseReponse,
  ContexteApprentissage,
  Correction,
  Cours,
  ExempleExpert,
  Exercice,
  IntentionBloc,
  Notion,
  PlanCours,
  Problematique,
  ProfilApprenant,
  QuestionDiagnostic,
  ReponseApprenant,
  Roadmap,
  SpecGraphique,
} from "@/core/domain";
import type {
  Adaptation,
  AnalyseurErreurs,
  ConcepteurDeCours,
  Correcteur,
  Diagnostic,
  GenerateurDeContenu,
  GenerateurExercices,
  GenerateurGraphique,
  GenerateurImage,
  GenerateurSchema,
  PlanificateurCours,
  PlanificationPedagogique,
  Remediation,
  ResultatAdaptation,
  StockageAssets,
} from "@/core/ports";
import { creerStockageAssetsMemoire } from "@/adapters/assets/memoire";

let compteurId = 0;

function prochainId(prefixe: string): string {
  compteurId += 1;
  return `${prefixe}-${compteurId}`;
}

/** Réinitialise le compteur d'identifiants — utile entre les tests. */
export function reinitialiserCompteurMock(): void {
  compteurId = 0;
}

export interface OptionsCapacitesMock {
  /** Surcharge le comportement de l'analyseur d'erreurs (ex. réponses incorrectes). */
  analyser?: (
    contexte: ContexteApprentissage,
    exercice: Exercice,
    reponse: ReponseApprenant,
  ) => Promise<AnalyseReponse>;
  /** Nombre de notions générées par la planification (défaut : 1). */
  nombreNotions?: number;
}

function planCoursMock(notion: Notion): PlanCours {
  const intentions: IntentionBloc[] = [
    {
      type: "texte",
      markdown: `# ${notion.titre}\n\nDécouvrons cette notion étape par étape, avec des supports variés.`,
    },
    {
      type: "encadre",
      variante: "astuce",
      titre: "Pourquoi c'est utile",
      markdown: "Cette notion te permet d'aller plus loin dans ton objectif.",
    },
    {
      type: "analogie",
      source: "une recette de cuisine",
      cible: notion.titre,
      explication: "Comme en cuisine, chaque étape s'appuie sur la précédente.",
    },
    {
      type: "schema",
      briefMedia: `Schéma du processus lié à « ${notion.titre} »`,
      legende: "Vue d'ensemble",
    },
    {
      type: "graphique",
      briefMedia: `Évolution de la compréhension de « ${notion.titre} »`,
      legende: "Progression type",
    },
    {
      type: "image",
      briefMedia: `Illustration pédagogique claire de « ${notion.titre} »`,
      alt: `Illustration de ${notion.titre}`,
    },
    {
      type: "etapes",
      etapes: [
        { titre: "Observer", markdown: "Identifie le problème concret." },
        { titre: "Comprendre", markdown: "Relie la notion à ce que tu sais déjà." },
        { titre: "Appliquer", markdown: "Teste sur un exemple simple." },
      ],
    },
    {
      type: "quizFlash",
      question: `Quelle est l'idée centrale de « ${notion.titre} » ?`,
      options: ["Une formule à mémoriser", "Un raisonnement à comprendre", "Une exception rare"],
      bonneReponse: 1,
      explication: "L'objectif est de **comprendre**, pas seulement mémoriser.",
    },
  ];

  return { titre: notion.titre, intentions };
}

function creerGenerateurImageMock(): GenerateurImage {
  const png1x1 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

  return {
    async genererImage({ brief }) {
      const bytes = Uint8Array.from(atob(png1x1), (c) => c.charCodeAt(0));
      return {
        bytes,
        mediaType: "image/png",
        alt: brief.slice(0, 80),
      };
    },
  };
}

function creerGenerateurSchemaMock(): GenerateurSchema {
  return {
    async genererSchema({ brief }) {
      return {
        mermaid: `flowchart TD\n  A[Début] --> B[${brief.slice(0, 30)}]\n  B --> C[Compréhension]`,
      };
    },
  };
}

function creerGenerateurGraphiqueMock(): GenerateurGraphique {
  return {
    async genererGraphique(): Promise<SpecGraphique> {
      return {
        genre: "barres",
        titre: "Progression (mock)",
        axeX: "Étape",
        series: [
          {
            nom: "Compréhension",
            points: [
              { etiquette: "Début", valeur: 20 },
              { etiquette: "Milieu", valeur: 55 },
              { etiquette: "Fin", valeur: 85 },
            ],
          },
        ],
      };
    },
  };
}

/** Implémentation factice des capacités IA — pour tests et développement hors ligne. */
export function creerCapacitesMock(options: OptionsCapacitesMock = {}): {
  diagnostic: Diagnostic;
  planification: PlanificationPedagogique;
  planificateurCours: PlanificateurCours;
  generateurContenu: GenerateurDeContenu;
  generateurSchema: GenerateurSchema;
  generateurGraphique: GenerateurGraphique;
  generateurImage: GenerateurImage;
  stockageAssets: StockageAssets;
  concepteurDeCours: ConcepteurDeCours;
  generateurExercices: GenerateurExercices;
  analyseurErreurs: AnalyseurErreurs;
  correcteur: Correcteur;
  remediation: Remediation;
  adaptation: Adaptation;
} {
  const diagnostic: Diagnostic = {
    async genererQuestions(): Promise<QuestionDiagnostic[]> {
      return Array.from({ length: 5 }, (_, index) => ({
        id: prochainId("q"),
        intitule: `Question de diagnostic ${index + 1} (mock)`,
      }));
    },
    async construireProfil(contexte): Promise<ProfilApprenant> {
      return {
        objectifId: contexte.objectif.id,
        acquis: [],
        competences: [],
        lacunes: [],
        erreursFrequentes: [],
        preferencesPedagogiques: [],
        notionsMaitrisees: [],
        miseAJour: new Date().toISOString(),
      };
    },
  };

  const planification: PlanificationPedagogique = {
    async genererRoadmap(contexte): Promise<Roadmap> {
      const nombre = options.nombreNotions ?? 1;
      const notions: Notion[] = [];
      for (let i = 0; i < nombre; i++) {
        const id = prochainId("notion");
        notions.push({
          id,
          titre: `Notion ${i + 1} (mock)`,
          prerequisIds: i > 0 ? [notions[i - 1]!.id] : [],
          objectifsPedagogiques: ["Comprendre les bases"],
          criteresDeMaitrise: [
            {
              id: prochainId("critere"),
              description: "Répondre correctement à un exercice autonome",
            },
          ],
        });
      }
      return { objectifId: contexte.objectif.id, version: 1, notions };
    },
  };

  const planificateurCours: PlanificateurCours = {
    async genererPlanCours(_contexte, notion): Promise<PlanCours> {
      return planCoursMock(notion);
    },
  };

  const generateurSchema = creerGenerateurSchemaMock();
  const generateurGraphique = creerGenerateurGraphiqueMock();
  const generateurImage = creerGenerateurImageMock();
  const stockageAssets = creerStockageAssetsMemoire();

  const concepteurDeCours = creerConcepteurDeCours({
    planificateurCours,
    generateurImage,
    generateurSchema,
    generateurGraphique,
    stockageAssets,
  });

  const generateurContenu: GenerateurDeContenu = {
    async genererProblematique(contexte, notion): Promise<Problematique> {
      return {
        notionId: notion.id,
        intitule: `Pourquoi apprendre « ${notion.titre} » pour « ${contexte.objectif.intitule} » ?`,
        forme: "question",
        casDusage: [
          {
            titre: `Appliquer « ${notion.titre} » au quotidien`,
            description: `Utiliser cette notion dans des situations concrètes liées à ton objectif.`,
          },
          {
            titre: `Progresser vers « ${contexte.objectif.intitule} »`,
            description: `Maîtriser une brique essentielle pour avancer dans ton projet.`,
          },
          {
            titre: "Gagner en autonomie",
            description: `Résoudre seul des situations réelles sans aide extérieure.`,
          },
        ],
      };
    },
    async genererCours(contexte, notion): Promise<Cours> {
      return concepteurDeCours.composerCours(contexte, notion);
    },
    async genererExempleExpert(_contexte, notion): Promise<ExempleExpert> {
      return {
        notionId: notion.id,
        contexte: "Situation réelle (mock)",
        demonstration: [
          {
            type: "texte",
            markdown: `Un expert utilise « ${notion.titre} » pour résoudre un problème concret.`,
          },
          {
            type: "encadre",
            variante: "exemple",
            titre: "En pratique",
            markdown: "Voici comment un professionnel raisonne étape par étape.",
          },
          {
            type: "analogie",
            source: "un GPS",
            cible: notion.titre,
            explication: "Comme un GPS recalcule l'itinéraire, l'expert ajuste sa méthode.",
          },
        ],
      };
    },
  };

  const generateurExercices: GenerateurExercices = {
    async genererExercice(_contexte, notion, guidage): Promise<Exercice> {
      return {
        id: prochainId("exo"),
        notionId: notion.id,
        enonce: `Exercice mock (${guidage})`,
        guidage,
      };
    },
  };

  const analyseurErreurs: AnalyseurErreurs = {
    async analyser(contexte, exercice, reponse): Promise<AnalyseReponse> {
      if (options.analyser) {
        return options.analyser(contexte, exercice, reponse);
      }
      return { correcte: true, pourquoi: "Réponse correcte (mock)" };
    },
  };

  const correcteur: Correcteur = {
    async corriger(_contexte, exercice, analyse): Promise<Correction> {
      return {
        exerciceId: exercice.id,
        analyse,
        explicationPersonnalisee: "Explication personnalisée (mock)",
      };
    },
  };

  const remediation: Remediation = {
    async genererExerciceCible(_contexte, notion, lacune): Promise<Exercice> {
      return {
        id: prochainId("rem"),
        notionId: notion.id,
        enonce: `Exercice de remédiation : ${lacune}`,
        guidage: "fort",
        cibleLacune: lacune,
      };
    },
  };

  const adaptation: Adaptation = {
    async adapter(contexte): Promise<ResultatAdaptation> {
      const roadmap =
        contexte.roadmap ?? (await planification.genererRoadmap(contexte));
      return { profil: contexte.profil, roadmap };
    },
  };

  return {
    diagnostic,
    planification,
    planificateurCours,
    generateurContenu,
    generateurSchema,
    generateurGraphique,
    generateurImage,
    stockageAssets,
    concepteurDeCours,
    generateurExercices,
    analyseurErreurs,
    correcteur,
    remediation,
    adaptation,
  };
}

/** Dépendances prêtes pour OrchestrateurCycle (mock). */
export function creerDependancesCycleMock(options: OptionsCapacitesMock = {}) {
  const capacites = creerCapacitesMock(options);
  return {
    generateurContenu: capacites.generateurContenu,
    concepteurDeCours: capacites.concepteurDeCours,
    generateurExercices: capacites.generateurExercices,
    analyseurErreurs: capacites.analyseurErreurs,
    correcteur: capacites.correcteur,
    remediation: capacites.remediation,
    adaptation: capacites.adaptation,
  };
}
