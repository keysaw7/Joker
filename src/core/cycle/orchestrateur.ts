import type {
  AnalyseReponse,
  ContexteApprentissage,
  EtatCycle,
  EtatExercices,
  Exercice,
  FeedbackItem,
  ModeleApprenant,
  Notion,
  Observation,
  ReponseApprenant,
} from "@/core/domain";
import { etatGrapheVide, formatExerciceEstFerme } from "@/core/domain";
import {
  creerLearningModel,
  grapheDepuisRoadmap,
  guidageInitialDepuisModele,
  projeterProfilApprenant,
  type LearningModel,
} from "@/core/modele-apprentissage";
import type {
  Adaptation,
  AnalyseurErreurs,
  ConcepteurDeCours,
  Correcteur,
  GenerateurDeContenu,
  GenerateurExercices,
  Persistance,
  PersistanceModeleApprentissage,
  Remediation,
} from "@/core/ports";
import { evaluerExercice } from "./evaluateurExercice";
import {
  choisirFormatExercice,
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

export interface DependancesOrchestrateur {
  generateurContenu: GenerateurDeContenu;
  concepteurDeCours: ConcepteurDeCours;
  generateurExercices: GenerateurExercices;
  analyseurErreurs: AnalyseurErreurs;
  correcteur: Correcteur;
  remediation: Remediation;
  adaptation: Adaptation;
  persistance?: Persistance;
  learningModel?: LearningModel;
  persistanceModele?: PersistanceModeleApprentissage;
}

export class OrchestrateurCycle {
  private readonly lm: LearningModel;

  constructor(private readonly deps: DependancesOrchestrateur) {
    this.lm = deps.learningModel ?? creerLearningModel();
  }

  async demarrer(contexte: ContexteApprentissage): Promise<EtatCycle> {
    if (!contexte.roadmap) {
      throw new Error(
        "L'orchestrateur du Cycle requiert une roadmap dans le contexte",
      );
    }

    let graphe = contexte.grapheCompetences;
    if (!graphe) {
      graphe = grapheDepuisRoadmap(contexte.roadmap, contexte.domaine.id);
    }

    const notionsMaitrisees = contexte.profil.notionsMaitrisees;
    const notion = this.resoudreNotion(contexte, notionsMaitrisees);
    if (!notion) {
      return this.etatTermine(contexte);
    }

    const contexteMisAJour = mettreAJourContexte(contexte, {
      notionCouranteId: notion.id,
      grapheCompetences: graphe,
      modeleApprenant:
        contexte.modeleApprenant ??
        this.lm.inference.initialiser(contexte.objectif.id),
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
        const guidageInitial = guidageInitialDepuisModele(
          contexte.modeleApprenant,
          contexte.profil.niveauEstime ?? 0,
        );
        const format = choisirFormatExercice(
          guidageInitial,
          contexte.modeleApprenant,
        );
        const exercice = await this.deps.generateurExercices.genererExercice(
          contexte,
          notion,
          guidageInitial,
          format,
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

    let analyse: AnalyseReponse;
    let items: readonly FeedbackItem[] = [];

    if (formatExerciceEstFerme(exercice.format)) {
      const evaluation = evaluerExercice(exercice, reponse);
      analyse = evaluation.analyse;
      items = evaluation.items;
    } else {
      analyse = await this.deps.analyseurErreurs.analyser(
        contexte,
        exercice,
        reponse,
      );
    }

    const integre = await this.integrerObservationsExercice(
      contexte,
      exercice,
      analyse,
      notion,
    );
    contexte = integre;

    contexte = mettreAJourContexte(contexte, {
      profil: enrichirProfil(contexte.profil, analyse, notion),
    });

    // Resynchronise la projection après enrichissement textuel
    if (contexte.modeleApprenant) {
      contexte = mettreAJourContexte(contexte, {
        profil: projeterProfilApprenant(
          contexte.modeleApprenant,
          contexte.grapheCompetences,
          contexte.objectif.id,
          contexte.profil,
        ),
      });
    }

    const correction = await this.deps.correcteur.corriger(
      contexte,
      exercice,
      analyse,
      items,
    );

    if (notionEstMaitrisee(etatExercices, analyse)) {
      contexte = mettreAJourContexte(contexte, {
        profil: marquerNotionMaitrisee(contexte.profil, notion),
      });

      // Observation de maîtrise de notion
      contexte = await this.marquerNotionDansModele(contexte, notion, true);

      const resultat = await this.deps.adaptation.adapter(contexte);
      const notionsMaitrisees = [
        ...new Set([
          ...contexte.profil.notionsMaitrisees,
          ...resultat.profil.notionsMaitrisees.filter((id) =>
            resultat.roadmap.notions.some((n) => n.id === id),
          ),
        ]),
      ];

      let graphe = contexte.grapheCompetences;
      if (graphe) {
        graphe = this.lm.graphe.fusionnerDepuisRoadmap(
          graphe,
          resultat.roadmap,
          contexte.domaine.id,
        );
      } else {
        graphe = grapheDepuisRoadmap(resultat.roadmap, contexte.domaine.id);
      }

      const profilFusionne = {
        ...resultat.profil,
        notionsMaitrisees,
      };
      const profilFinal = contexte.modeleApprenant
        ? projeterProfilApprenant(
            contexte.modeleApprenant,
            graphe,
            contexte.objectif.id,
            profilFusionne,
          )
        : profilFusionne;

      const contexteAdapte = mettreAJourContexte(contexte, {
        profil: profilFinal,
        roadmap: resultat.roadmap,
        grapheCompetences: graphe,
      });
      await this.persiste(contexteAdapte);
      await this.persisteModele(contexteAdapte.modeleApprenant);

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
    const recommandation = contexte.modeleApprenant && contexte.grapheCompetences
      ? this.lm.recommandation.recommander(
          contexte.modeleApprenant,
          contexte.grapheCompetences,
          {
            phase: "cycle",
            notionsEligibles: [notion.id],
            notionsMaitrisees: contexte.profil.notionsMaitrisees,
          },
        )
      : null;

    const guidageSuivant =
      recommandation?.type === "exercer" && recommandation.notionId === notion.id
        ? recommandation.guidage
        : prochainGuidage(etatExercices.guidageActuel, analyse);

    let prochainExercice: Exercice;
    let lacuneActive: string | null = null;

    if (lacune || recommandation?.type === "remedier") {
      const cible =
        lacune ??
        (recommandation?.type === "remedier" ? recommandation.erreurId : null);
      if (cible) {
        const formatRemediation =
          recommandation?.type === "exercer" && recommandation.format
            ? recommandation.format
            : choisirFormatExercice(GUIDAGE_INITIAL, contexte.modeleApprenant, {
                remediation: true,
              });
        prochainExercice = await this.deps.remediation.genererExerciceCible(
          contexte,
          notion,
          cible,
          formatRemediation,
        );
        lacuneActive = cible;
      } else {
        const format =
          recommandation?.type === "exercer" && recommandation.format
            ? recommandation.format
            : choisirFormatExercice(guidageSuivant, contexte.modeleApprenant);
        prochainExercice = await this.deps.generateurExercices.genererExercice(
          contexte,
          notion,
          guidageSuivant,
          format,
        );
      }
    } else {
      const format =
        recommandation?.type === "exercer" && recommandation.format
          ? recommandation.format
          : choisirFormatExercice(guidageSuivant, contexte.modeleApprenant);
      prochainExercice = await this.deps.generateurExercices.genererExercice(
        contexte,
        notion,
        guidageSuivant,
        format,
      );
    }

    const nouvelEtatExercices: EtatExercices = {
      exerciceCourant: prochainExercice,
      guidageActuel: lacuneActive ? GUIDAGE_INITIAL : guidageSuivant,
      lacuneActive,
    };

    await this.persisteModele(contexte.modeleApprenant);

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

  private async integrerObservationsExercice(
    contexte: ContexteApprentissage,
    exercice: import("@/core/domain").Exercice,
    analyse: import("@/core/domain").AnalyseReponse,
    notion: Notion,
  ): Promise<ContexteApprentissage> {
    const graphe =
      contexte.grapheCompetences ??
      (contexte.roadmap
        ? grapheDepuisRoadmap(contexte.roadmap, contexte.domaine.id)
        : etatGrapheVide(contexte.domaine.id));

    let modele =
      contexte.modeleApprenant ??
      this.lm.inference.initialiser(contexte.objectif.id);

    const observations = [
      ...this.lm.observation.depuisReponseExercice(exercice, analyse, {
        eleveId: modele.eleveId,
        objectifId: contexte.objectif.id,
        notionId: notion.id,
        noeudIds: [notion.id],
      }),
      this.lm.observation.depuisSignalComportemental({
        type: "preference_format",
        eleveId: modele.eleveId,
        objectifId: contexte.objectif.id,
        notionId: notion.id,
        noeudIds: [notion.id],
        format: exercice.format,
        succes: analyse.correcte,
      }),
    ];

    modele = this.lm.inference.integrerLot(modele, observations, graphe);

    for (const obs of observations) {
      await this.persisteObservation(obs);
    }

    return mettreAJourContexte(contexte, {
      modeleApprenant: modele,
      grapheCompetences: graphe,
    });
  }

  private async marquerNotionDansModele(
    contexte: ContexteApprentissage,
    notion: Notion,
    succes: boolean,
  ): Promise<ContexteApprentissage> {
    if (!contexte.modeleApprenant) {
      return contexte;
    }
    const graphe =
      contexte.grapheCompetences ?? etatGrapheVide(contexte.domaine.id);
    const observation: Observation = {
      id: crypto.randomUUID(),
      eleveId: contexte.modeleApprenant.eleveId,
      type: "revision",
      horodatage: new Date().toISOString(),
      noeudIds: [notion.id],
      preuve: { type: "revision", succes },
      meta: {
        objectifId: contexte.objectif.id,
        notionId: notion.id,
        source: "systeme",
      },
    };
    const modele = this.lm.inference.integrer(
      contexte.modeleApprenant,
      observation,
      graphe,
    );
    await this.persisteObservation(observation);
    return mettreAJourContexte(contexte, { modeleApprenant: modele });
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

  private async persisteModele(
    modele: ModeleApprenant | null | undefined,
  ): Promise<void> {
    if (!this.deps.persistanceModele || !modele) {
      return;
    }
    await this.deps.persistanceModele.sauvegarderModele(modele);
  }

  private async persisteObservation(observation: Observation): Promise<void> {
    if (!this.deps.persistanceModele) {
      return;
    }
    await this.deps.persistanceModele.ajouterObservation(observation);
  }
}
