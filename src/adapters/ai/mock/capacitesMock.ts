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
  ReponseApprenant,
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
  const paragrapheDense =
    "Pour deux portions, on part en général de **300 g de farine**. " +
    "L'hydratation se calcule en pourcentage : eau ÷ farine × 100. " +
    "Une pâte standard se situe souvent entre **60 % et 70 %**, soit **180 à 210 g d'eau** pour 300 g de farine. " +
    "Ajoute environ **6 g de sel** (2 % du poids de farine) et **3 à 4 g de levure** sèche selon le temps de repos. " +
    "Pèse tes ingrédients : c'est la base d'une pâte régulière et reproductible.";

  const intentions: IntentionBloc[] = [
    {
      type: "texte",
      markdown: `## ${notion.titre}\n\n${paragrapheDense}`,
    },
    {
      type: "encadre",
      variante: "astuce",
      titre: "Pour ton objectif",
      markdown:
        "Note tes ratios sur une fiche près du plan de travail : farine, eau, sel, levure. " +
        "Tu ajustes ensuite l'hydratation selon la farine et le temps de fermentation disponible.",
    },
    {
      type: "analogie",
      source: "une recette de cuisine",
      cible: notion.titre,
      explication:
        "Comme pour une recette, un petit écart sur l'eau change la texture : trop sèche, la pâte se déchire ; trop hydratée, elle colle.",
    },
    {
      type: "schema",
      briefMedia: `Flowchart : pesée farine → calcul eau selon hydratation % → ajout sel et levure → repos → étalage → cuisson, pour « ${notion.titre} »`,
      legende: "Enchaînement des étapes clés",
    },
    {
      type: "graphique",
      briefMedia: `Barres comparant hydratation 55 %, 65 % et 75 % : maniabilité et alvéolage pour « ${notion.titre} »`,
      legende: "Effet de l'hydratation sur la pâte",
    },
    {
      type: "image",
      briefMedia: `Plan de travail avec balance, bol de pâte et ingrédients étiquetés pour « ${notion.titre} »`,
      alt: `Illustration des quantités pour ${notion.titre}`,
    },
    {
      type: "etapes",
      etapes: [
        {
          titre: "Peser la farine",
          markdown: "300 g pour deux portions. C'est la référence pour tous les autres calculs.",
        },
        {
          titre: "Calculer l'eau",
          markdown: "65 % d'hydratation → 195 g d'eau. Mélange progressivement jusqu'à incorporation homogène.",
        },
        {
          titre: "Repos et cuisson",
          markdown:
            "Laisse reposer au moins 30 min à température ambiante, étale finement, puis cuisson forte (pierre ou plaque préchauffée).",
        },
      ],
    },
    {
      type: "texte",
      markdown:
        "## À retenir\n\n" +
        "Fixe d'abord la farine, choisis ton **pourcentage d'hydratation**, puis déduis eau, sel et levure. " +
        "Tu peux reproduire la même pâte en adaptant seulement le temps de repos.",
    },
    {
      type: "quizFlash",
      question: `Quelle plage d'hydratation est typique pour une pâte à pizza standard ?`,
      options: ["50–55 %", "60–70 %", "75–85 %", "90 %"],
      bonneReponse: 1,
      explication:
        "Entre **60 % et 70 %**, la pâte reste maniable tout en développant une bonne structure à la cuisson.",
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
    async genererQuestion(contexte, params) {
      const index = contexte.reponsesDiagnostic.length;
      const competenceId = `comp-mock-${index + 1}`;
      return {
        id: prochainId("q"),
        intitule: `Question diagnostic ${index + 1} (mock, diff. ${params.difficulteCible})`,
        competenceId,
        competenceLibelle: `Compétence mock ${index + 1}`,
        difficulte: params.difficulteCible,
      };
    },
    async evaluerReponse(_contexte, question) {
      return {
        questionId: question.id,
        maitrise: "maitrise",
        justification: "Réponse mock évaluée comme maîtrisée.",
      };
    },
    async construireProfil(contexte): Promise<ProfilApprenant> {
      return {
        objectifId: contexte.objectif.id,
        acquis: ["Base mock"],
        competences: ["Raisonnement mock"],
        lacunes: [],
        erreursFrequentes: [],
        preferencesPedagogiques: [],
        notionsMaitrisees: [],
        niveauEstime: contexte.estimationNiveau?.scoreGlobal ?? null,
        miseAJour: new Date().toISOString(),
      };
    },
  };

  const planification: PlanificationPedagogique = {
    async genererRoadmap(contexte) {
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
      const roadmap = { objectifId: contexte.objectif.id, version: 1, notions };
      return { roadmap, notionsPreMaitrisees: [] };
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
        contexte.roadmap ??
        (await planification.genererRoadmap(contexte)).roadmap;
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
