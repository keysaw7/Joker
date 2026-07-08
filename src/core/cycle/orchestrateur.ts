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
  Correcteur,
  GenerateurDeContenu,
  GenerateurExercices,
  Persistance,
  Remediation,
} from "@/core/ports";
import {
  creerRecompense,
  extraireLacune,
  mettreAJourContexte,
  notionEstMaitrisee,
  prochainGuidage,
  selectionnerNotionCourante,
} from "./regles";

export interface DependancesOrchestrateur {
  generateurContenu: GenerateurDeContenu;
  generateurExercices: GenerateurExercices;
  analyseurErreurs: AnalyseurErreurs;
  correcteur: Correcteur;
  remediation: Remediation;
  adaptation: Adaptation;
  persistance?: Persistance;
}

export class OrchestrateurCycle {
  constructor(private readonly deps: DependancesOrchestrateur) {}

  async demarrer(
    contexte: ContexteApprentissage,
    notionsMaitrisees: readonly string[] = [],
  ): Promise<EtatCycle> {
    const notion = this.resoudreNotion(contexte, notionsMaitrisees);
    if (!notion) {
      return this.etatTermine(contexte, notionsMaitrisees);
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
      notionsMaitrisees,
      termine: false,
    };
  }

  async avancer(etat: EtatCycle): Promise<EtatCycle> {
    const notion = this.notionDepuisEtat(etat);
    const { contexte } = etat;

    switch (etat.etape) {
      case "problematique": {
        const cours = await this.deps.generateurContenu.genererCours(contexte, notion);
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
        const exercice = await this.deps.generateurExercices.genererExercice(
          contexte,
          notion,
          "fort",
        );
        const etatExercices: EtatExercices = {
          exerciceCourant: exercice,
          guidageActuel: "fort",
          tentatives: 0,
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

    const notion = this.notionDepuisEtat(etat);
    const { etatExercices, contexte } = etat;
    const exercice = etatExercices.exerciceCourant;

    const analyse = await this.deps.analyseurErreurs.analyser(
      contexte,
      exercice,
      reponse,
    );
    const correction = await this.deps.correcteur.corriger(
      contexte,
      exercice,
      analyse,
    );

    if (notionEstMaitrisee(etatExercices, analyse)) {
      const resultat = await this.deps.adaptation.adapter(contexte);
      const contexteAdapte = mettreAJourContexte(contexte, {
        profil: resultat.profil,
        roadmap: resultat.roadmap,
      });
      await this.persiste(contexteAdapte);

      const notionsMaitrisees = [...etat.notionsMaitrisees, notion.id];
      const recompense = creerRecompense(notion);

      return {
        contexte: contexteAdapte,
        etape: "recompense",
        contenu: { type: "recompense", recompense },
        etatExercices: null,
        notionsMaitrisees,
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
      guidageActuel: lacune ? "fort" : guidageSuivant,
      tentatives: etatExercices.tentatives + 1,
      lacuneActive,
    };

    return {
      ...etat,
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
      return this.etatTermine(etat.contexte, etat.notionsMaitrisees);
    }

    const notionSuivante = selectionnerNotionCourante(
      roadmap,
      etat.notionsMaitrisees,
    );
    if (!notionSuivante) {
      return this.etatTermine(etat.contexte, etat.notionsMaitrisees);
    }

    const contexte = mettreAJourContexte(etat.contexte, {
      notionCouranteId: notionSuivante.id,
    });

    return this.demarrer(contexte, etat.notionsMaitrisees);
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
      if (notion && !notionsMaitrisees.includes(notion.id)) {
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

  private etatTermine(
    contexte: ContexteApprentissage,
    notionsMaitrisees: readonly string[],
  ): EtatCycle {
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
      notionsMaitrisees,
      termine: true,
    };
  }

  private async persiste(contexte: ContexteApprentissage): Promise<void> {
    if (!this.deps.persistance) {
      return;
    }
    await this.deps.persistance.sauvegarderProfil(contexte.profil);
    if (contexte.roadmap) {
      await this.deps.persistance.sauvegarderRoadmap(contexte.roadmap);
    }
  }
}
