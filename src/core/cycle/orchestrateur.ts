import type {
  ContexteApprentissage,
  EtatCycle,
  EtatExercices,
  Notion,
  ReponseApprenant,
} from "@/core/domain";
import type {
  Adaptation,
  AnalyseurErreurs,
  ConcepteurDeCours,
  Correcteur,
  GenerateurDeContenu,
  GenerateurExercices,
  Persistance,
  Remediation,
} from "@/core/ports";
import {
  creerRecompense,
  enrichirProfil,
  extraireLacune,
  GUIDAGE_INITIAL,
  marquerNotionMaitrisee,
  mettreAJourContexte,
  notionEstMaitrisee,
  prerequisSatisfaits,
  prochainGuidage,
  selectionnerNotionCourante,
} from "./regles";
import { guidageInitialDepuisScore } from "@/core/parcours/reglesDiagnostic";

export interface DependancesOrchestrateur {
  generateurContenu: GenerateurDeContenu;
  concepteurDeCours: ConcepteurDeCours;
  generateurExercices: GenerateurExercices;
  analyseurErreurs: AnalyseurErreurs;
  correcteur: Correcteur;
  remediation: Remediation;
  adaptation: Adaptation;
  persistance?: Persistance;
}

export class OrchestrateurCycle {
  constructor(private readonly deps: DependancesOrchestrateur) {}

  async demarrer(contexte: ContexteApprentissage): Promise<EtatCycle> {
    if (!contexte.roadmap) {
      throw new Error(
        "L'orchestrateur du Cycle requiert une roadmap dans le contexte",
      );
    }

    const notionsMaitrisees = contexte.profil.notionsMaitrisees;
    const notion = this.resoudreNotion(contexte, notionsMaitrisees);
    if (!notion) {
      return this.etatTermine(contexte);
    }

    const contexteMisAJour = mettreAJourContexte(contexte, {
      notionCouranteId: notion.id,
    });
    const problematique = await this.deps.generateurContenu.genererProblematique(
      contexteMisAJour,
      notion,
    );

    return {
      contexte: contexteMisAJour,
      etape: "problematique",
      contenu: { type: "problematique", problematique },
      etatExercices: null,
      termine: false,
    };
  }

  async avancer(etat: EtatCycle): Promise<EtatCycle> {
    const notion = this.notionDepuisEtat(etat);
    const { contexte } = etat;

    switch (etat.etape) {
      case "problematique": {
        const cours = await this.deps.concepteurDeCours.composerCours(contexte, notion);
        return { ...etat, etape: "cours", contenu: { type: "cours", cours } };
      }
      case "cours": {
        const exemple = await this.deps.generateurContenu.genererExempleExpert(
          contexte,
          notion,
        );
        return {
          ...etat,
          etape: "exempleExpert",
          contenu: { type: "exempleExpert", exemple },
        };
      }
      case "exempleExpert": {
        const guidageInitial = guidageInitialDepuisScore(
          contexte.profil.niveauEstime ?? 0,
        );
        const exercice = await this.deps.generateurExercices.genererExercice(
          contexte,
          notion,
          guidageInitial,
        );
        const etatExercices: EtatExercices = {
          exerciceCourant: exercice,
          guidageActuel: guidageInitial,
          lacuneActive: null,
        };
        return {
          ...etat,
          etape: "exercices",
          contenu: { type: "exercice", exercice },
          etatExercices,
        };
      }
      default:
        throw new Error(
          `Impossible d'avancer depuis l'étape « ${etat.etape} »`,
        );
    }
  }

  async repondreExercice(
    etat: EtatCycle,
    reponse: ReponseApprenant,
  ): Promise<EtatCycle> {
    if (etat.etape !== "exercices" || !etat.etatExercices) {
      throw new Error("repondreExercice n'est disponible qu'à l'étape exercices");
    }

    const exercice = etat.etatExercices.exerciceCourant;
    if (reponse.exerciceId !== exercice.id) {
      throw new Error("La réponse ne correspond pas à l'exercice courant");
    }

    const notion = this.notionDepuisEtat(etat);
    const { etatExercices } = etat;
    let { contexte } = etat;

    const analyse = await this.deps.analyseurErreurs.analyser(
      contexte,
      exercice,
      reponse,
    );

    contexte = mettreAJourContexte(contexte, {
      profil: enrichirProfil(contexte.profil, analyse, notion),
    });

    const correction = await this.deps.correcteur.corriger(
      contexte,
      exercice,
      analyse,
    );

    if (notionEstMaitrisee(etatExercices, analyse)) {
      contexte = mettreAJourContexte(contexte, {
        profil: marquerNotionMaitrisee(contexte.profil, notion),
      });

      const resultat = await this.deps.adaptation.adapter(contexte);
      // Fusionne l'adaptation IA sans perdre les notions déjà maîtrisées
      // (les IDs de notions sont préservés côté adapter / construireRoadmap).
      const notionsMaitrisees = [
        ...new Set([
          ...contexte.profil.notionsMaitrisees,
          ...resultat.profil.notionsMaitrisees.filter((id) =>
            resultat.roadmap.notions.some((n) => n.id === id),
          ),
        ]),
      ];
      const contexteAdapte = mettreAJourContexte(contexte, {
        profil: {
          ...resultat.profil,
          notionsMaitrisees,
        },
        roadmap: resultat.roadmap,
      });
      await this.persiste(contexteAdapte);

      const recompense = creerRecompense(notion);

      return {
        contexte: contexteAdapte,
        etape: "recompense",
        contenu: { type: "recompense", recompense, correctionPrecedente: correction },
        etatExercices: null,
        termine: false,
      };
    }

    const lacune = extraireLacune(analyse);
    const guidageSuivant = prochainGuidage(etatExercices.guidageActuel, analyse);

    let prochainExercice;
    let lacuneActive: string | null = null;

    if (lacune) {
      prochainExercice = await this.deps.remediation.genererExerciceCible(
        contexte,
        notion,
        lacune,
      );
      lacuneActive = lacune;
    } else {
      prochainExercice = await this.deps.generateurExercices.genererExercice(
        contexte,
        notion,
        guidageSuivant,
      );
    }

    const nouvelEtatExercices: EtatExercices = {
      exerciceCourant: prochainExercice,
      guidageActuel: lacune ? GUIDAGE_INITIAL : guidageSuivant,
      lacuneActive,
    };

    return {
      ...etat,
      contexte,
      contenu: {
        type: "exercice",
        exercice: prochainExercice,
        correctionPrecedente: correction,
      },
      etatExercices: nouvelEtatExercices,
    };
  }

  async terminerEtPasserSuivant(etat: EtatCycle): Promise<EtatCycle> {
    if (etat.etape !== "recompense") {
      throw new Error(
        "terminerEtPasserSuivant n'est disponible qu'à l'étape recompense",
      );
    }

    const roadmap = etat.contexte.roadmap;
    if (!roadmap) {
      return this.etatTermine(etat.contexte);
    }

    const notionSuivante = selectionnerNotionCourante(
      roadmap,
      etat.contexte.profil.notionsMaitrisees,
    );
    if (!notionSuivante) {
      return this.etatTermine(etat.contexte);
    }

    const contexte = mettreAJourContexte(etat.contexte, {
      notionCouranteId: notionSuivante.id,
    });

    return this.demarrer(contexte);
  }

  private resoudreNotion(
    contexte: ContexteApprentissage,
    notionsMaitrisees: readonly string[],
  ): Notion | null {
    if (!contexte.roadmap) {
      return null;
    }

    if (contexte.notionCouranteId) {
      const notion = contexte.roadmap.notions.find(
        (n) => n.id === contexte.notionCouranteId,
      );
      if (
        notion &&
        !notionsMaitrisees.includes(notion.id) &&
        prerequisSatisfaits(notion, notionsMaitrisees)
      ) {
        return notion;
      }
    }

    return selectionnerNotionCourante(contexte.roadmap, notionsMaitrisees);
  }

  private notionDepuisEtat(etat: EtatCycle): Notion {
    const { contexte } = etat;
    if (!contexte.roadmap || !contexte.notionCouranteId) {
      throw new Error("Notion courante introuvable dans le contexte");
    }
    const notion = contexte.roadmap.notions.find(
      (n) => n.id === contexte.notionCouranteId,
    );
    if (!notion) {
      throw new Error(`Notion « ${contexte.notionCouranteId} » introuvable`);
    }
    return notion;
  }

  private etatTermine(contexte: ContexteApprentissage): EtatCycle {
    const notionsMaitrisees = contexte.profil.notionsMaitrisees;
    const derniereNotion = contexte.roadmap?.notions.find((n) =>
      notionsMaitrisees.includes(n.id),
    );
    return {
      contexte,
      etape: "recompense",
      contenu: {
        type: "recompense",
        recompense: {
          notionId: derniereNotion?.id ?? "",
          titre: "Parcours terminé",
          message: "Félicitations ! Tu as maîtrisé toutes les notions.",
        },
      },
      etatExercices: null,
      termine: true,
    };
  }

  private async persiste(contexte: ContexteApprentissage): Promise<void> {
    if (!this.deps.persistance) {
      return;
    }
    await this.deps.persistance.sauvegarderProfil(contexte.profil);
    await this.deps.persistance.sauvegarderObjectif(contexte.objectif);
    if (contexte.roadmap) {
      await this.deps.persistance.sauvegarderRoadmap(contexte.roadmap);
    }
  }
}
