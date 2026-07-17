import { creerConcepteurDeCours } from "@/core/cours/concepteurDeCours";
import type {
  AnalyseReponse,
  ContexteApprentissage,
  Correction,
  Cours,
  ExempleExpert,
  Exercice,
  FormatExercice,
  IntentionBloc,
  NiveauGuidage,
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

function exerciceMock(
  notion: Notion,
  guidage: NiveauGuidage,
  format: FormatExercice,
  extras?: { readonly cibleLacune?: string; readonly prefixeId?: string },
): Exercice {
  const id = prochainId(extras?.prefixeId ?? "exo");
  const base = {
    id,
    notionId: notion.id,
    guidage,
    consigne: `Consigne mock (${format}, ${guidage})`,
    ...(extras?.cibleLacune != null ? { cibleLacune: extras.cibleLacune } : {}),
  };

  switch (format) {
    case "qcm":
      return {
        ...base,
        format: "qcm",
        question: "Quelle est la bonne réponse ?",
        options: ["Bonne réponse", "Distracteur A", "Distracteur B"],
        bonneReponse: 0,
      };
    case "trous":
      return {
        ...base,
        format: "trous",
        phrases: [
          {
            id: `${id}-p1`,
            texteAvecTrous: "Bonjour se dit ___ .",
            solutions: ["konnichiwa", "こんにちは"],
          },
        ],
      };
    case "appariement":
      return {
        ...base,
        format: "appariement",
        paires: [
          { id: `${id}-a1`, gauche: "bonjour", droite: "こんにちは" },
          { id: `${id}-a2`, gauche: "merci", droite: "ありがとう" },
        ],
      };
    case "production_libre":
      return {
        ...base,
        format: "production_libre",
        enonce: `Exercice mock (${guidage})`,
        criteres: ["Réponse claire"],
      };
  }
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
    "Les **salutations de base** ouvrent presque toute interaction en japonais. " +
    "**こんにちは** (konnichiwa) sert le jour ; **こんばんは** (konbanwa) le soir. " +
    "**おはよう** (ohayō) le matin — **ございます** (gozaimasu) rend la formule plus polie. " +
    "Pour te présenter : **はじめまして** (hajimemashite) puis **よろしくお願いします** (yoroshiku onegaishimasu). " +
    "Écoute la prononciation et répète à voix haute : c'est la base du JLPT N5 et du quotidien.";

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
        "Note sur une fiche les formules avec **romaji** et sens en français. " +
        "Tu peux ensuite les réutiliser en jeu de rôle (konbini, cours, premier contact).",
    },
    {
      type: "analogie",
      source: "dire bonjour en français",
      cible: notion.titre,
      explication:
        "Comme en français (bonjour / bonsoir), le japonais choisit la formule selon le moment et le registre (familier vs poli).",
    },
    {
      type: "schema",
      briefMedia: `Flowchart : repérer le moment de la journée → choisir こんにちは / こんばんは / おはよう → ajouter ございます si poli → présentation はじめまして pour « ${notion.titre} »`,
      legende: "Enchaînement des étapes clés",
    },
    {
      type: "graphique",
      briefMedia: `Barres comparant registre neutre vs poli pour les mêmes situations (matin, jour, soir) pour « ${notion.titre} »`,
      legende: "Registre et politesse",
    },
    {
      type: "image",
      briefMedia: `Scène de rue au Japon : deux personnes se saluent avec bulles en hiragana pour « ${notion.titre} »`,
      alt: `Illustration des salutations pour ${notion.titre}`,
    },
    {
      type: "etapes",
      etapes: [
        {
          titre: "Saluer selon l'heure",
          markdown: "Jour : こんにちは. Soir : こんばんは. Matin poli : おはようございます.",
        },
        {
          titre: "Se présenter",
          markdown: "はじめまして + ton prénom (ex. …です) + よろしくお願いします.",
        },
        {
          titre: "S'entraîner",
          markdown:
            "Répète chaque formule trois fois à voix haute, puis enchaîne une mini-présentation complète.",
        },
      ],
    },
    {
      type: "texte",
      markdown:
        "## À retenir\n\n" +
        "Choisis la salutation selon **l'heure** et le **registre**, puis enchaîne **はじめまして** et **よろしくお願いします** pour une première rencontre.",
    },
    {
      type: "quizFlash",
      question: `Quelle salutation convient en milieu de journée, de façon standard ?`,
      options: ["おはよう", "こんにちは", "こんばんは", "さようなら"],
      bonneReponse: 1,
      explication:
        "**こんにちは** est la formule habituelle entre le matin et le début de soirée.",
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
    async genererExercice(_contexte, notion, guidage, format): Promise<Exercice> {
      return exerciceMock(notion, guidage, format);
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
    async corriger(_contexte, exercice, analyse, items = []): Promise<Correction> {
      return {
        exerciceId: exercice.id,
        analyse,
        resume: "Explication personnalisée (mock)",
        items,
        ...(analyse.correcte
          ? { pointsForts: ["Bonne maîtrise du point travaillé"] }
          : { aRetravailler: ["Revois ce point avant de continuer"] }),
      };
    },
  };

  const remediation: Remediation = {
    async genererExerciceCible(_contexte, notion, lacune, format): Promise<Exercice> {
      return exerciceMock(notion, "fort", format, {
        cibleLacune: lacune,
        prefixeId: "rem",
      });
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
