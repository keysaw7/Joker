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

/** Implémentation factice des capacités IA — pour tests et développement hors ligne. */
export function creerCapacitesMock(options: OptionsCapacitesMock = {}): {
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
    async genererQuestion(): Promise<QuestionDiagnostic> {
      return { id: prochainId("q"), intitule: "Question de diagnostic (mock)" };
    },
    async estTermine(contexte): Promise<boolean> {
      return contexte.reponsesDiagnostic.length >= 2;
    },
    async construireProfil(contexte): Promise<ProfilApprenant> {
      return {
        objectifId: contexte.objectif.id,
        acquis: [],
        competences: [],
        lacunes: [],
        erreursFrequentes: [],
        preferencesPedagogiques: [],
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

  const generateurContenu: GenerateurDeContenu = {
    async genererProblematique(_contexte, notion): Promise<Problematique> {
      return {
        notionId: notion.id,
        intitule: `Pourquoi apprendre « ${notion.titre} » ?`,
        forme: "question",
      };
    },
    async genererCours(_contexte, notion): Promise<Cours> {
      return {
        notionId: notion.id,
        titre: notion.titre,
        blocs: [{ format: "texte", contenu: `Cours mock pour « ${notion.titre} ».` }],
      };
    },
    async genererExempleExpert(_contexte, notion): Promise<ExempleExpert> {
      return {
        notionId: notion.id,
        contexte: "Situation réelle (mock)",
        demonstration: [
          { format: "texte", contenu: `Démonstration experte de « ${notion.titre} ».` },
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
    generateurContenu,
    generateurExercices,
    analyseurErreurs,
    correcteur,
    remediation,
    adaptation,
  };
}
