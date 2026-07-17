import type {
  ContexteApprentissage,
  Domaine,
  EtatParcours,
  ModeleApprenant,
  Objectif,
  Observation,
  ReponseDiagnostic,
} from "@/core/domain";
import { etatGrapheVide } from "@/core/domain";
import type { ChampsProfilElevePersistes } from "@/core/domain/profilEleve";
import { champsProfilEleveInitiaux } from "@/core/domain/profilEleve";
import {
  creerLearningModel,
  grapheDepuisRoadmap,
  projeterEstimationDepuisModele,
  projeterProfilApprenant,
  type LearningModel,
} from "@/core/modele-apprentissage";
import type {
  Diagnostic,
  Persistance,
  PersistanceModeleApprentissage,
  PlanificationPedagogique,
} from "@/core/ports";
import { ajouterReponse, contexteInitial } from "./regles";
import {
  appliquerMaitriseInitiale,
  competencesCouvertes,
  DIFFICULTE_INITIALE,
  diagnosticEstTermine,
  mettreAJourEstimation,
  prochaineDifficulte,
} from "./reglesDiagnostic";

export interface DependancesParcours {
  diagnostic: Diagnostic;
  planification: PlanificationPedagogique;
  persistance?: Persistance;
  learningModel?: LearningModel;
  persistanceModele?: PersistanceModeleApprentissage;
}

export type ResultatReponseDiagnostic =
  | { readonly termine: false; readonly etat: EtatParcours }
  | { readonly termine: true; readonly etat: EtatParcours };

export class OrchestrateurParcours {
  private readonly lm: LearningModel;

  constructor(private readonly deps: DependancesParcours) {
    this.lm = deps.learningModel ?? creerLearningModel();
  }

  async demarrer(domaine: Domaine, objectif: Objectif): Promise<EtatParcours> {
    const contexte = contexteInitial(domaine, objectif);
    const questionCourante = await this.deps.diagnostic.genererQuestion(contexte, {
      difficulteCible: DIFFICULTE_INITIALE,
      competencesDejaCouvertes: [],
      estimation: null,
    });

    return {
      contexte,
      phase: "diagnostic",
      questionCourante,
      questionsPosees: 0,
      historiqueMaitrise: [],
    };
  }

  async repondre(
    etat: EtatParcours,
    texteReponse: string,
  ): Promise<ResultatReponseDiagnostic> {
    if (etat.phase !== "diagnostic") {
      throw new Error("repondre n'est disponible qu'en phase diagnostic");
    }

    const question = etat.questionCourante;
    if (!question) {
      throw new Error("Aucune question de diagnostic en cours");
    }

    const reponse: ReponseDiagnostic = {
      questionId: question.id,
      reponse: texteReponse.trim(),
    };

    if (!reponse.reponse) {
      throw new Error("Réponse vide");
    }

    const evaluation = await this.deps.diagnostic.evaluerReponse(
      etat.contexte,
      question,
      reponse,
    );

    let contexte = ajouterReponse(etat.contexte, reponse);
    const historique = [
      ...etat.historiqueMaitrise,
      { difficulte: question.difficulte, maitrise: evaluation.maitrise },
    ];

    const competence = this.lm.registre.resoudre(
      contexte.domaine.id,
      question.competenceId,
      question.competenceLibelle,
    );

    let graphe = contexte.grapheCompetences ?? etatGrapheVide(contexte.domaine.id);
    graphe = this.lm.graphe.ajouterNoeud(graphe, {
      id: competence.id,
      type: "competence",
      libelle: competence.libelle,
      domaineId: contexte.domaine.id,
    });

    let modele =
      contexte.modeleApprenant ??
      this.lm.inference.initialiser(contexte.objectif.id);

    const observation = this.lm.observation.depuisEvaluationDiagnostic(
      { ...question, competenceId: competence.id },
      evaluation,
      {
        eleveId: modele.eleveId,
        objectifId: contexte.objectif.id,
        noeudIds: [competence.id],
      },
    );

    modele = this.lm.inference.integrer(modele, observation, graphe);

    const estimationBase = contexte.estimationNiveau ?? {
      scoreGlobal: 0,
      competences: [],
      confiance: 0,
      evaluations: [],
    };
    const estimationLegacy = mettreAJourEstimation(
      estimationBase,
      { ...question, competenceId: competence.id },
      evaluation,
      historique,
    );
    const estimation = projeterEstimationDepuisModele(
      modele,
      graphe,
      estimationLegacy,
    );

    contexte = {
      ...contexte,
      modeleApprenant: modele,
      grapheCompetences: graphe,
      estimationNiveau: estimation,
    };

    await this.persisteObservation(observation);
    await this.persisteModele(modele);

    const questionsPosees = etat.questionsPosees + 1;
    const incertitude = this.lm.incertitude.incertitudeGlobale(modele);

    if (
      !diagnosticEstTermine(
        questionsPosees,
        estimation,
        historique,
        incertitude,
      )
    ) {
      const action = this.lm.recommandation.recommander(modele, graphe, {
        phase: "diagnostic",
      });
      const difficulteCible =
        action.type === "sonder_competence"
          ? (Math.max(1, Math.min(5, Math.round(action.difficulte))) as 1 | 2 | 3 | 4 | 5)
          : prochaineDifficulte(question.difficulte, evaluation.maitrise);

      const questionCourante = await this.deps.diagnostic.genererQuestion(
        contexte,
        {
          difficulteCible,
          competencesDejaCouvertes: competencesCouvertes(contexte),
          estimation,
        },
      );

      return {
        termine: false,
        etat: {
          contexte,
          phase: "diagnostic",
          questionCourante,
          questionsPosees,
          historiqueMaitrise: historique,
        },
      };
    }

    const profilLlm = await this.deps.diagnostic.construireProfil(contexte);
    const profilProjete = projeterProfilApprenant(
      modele,
      graphe,
      contexte.objectif.id,
      profilLlm,
    );
    contexte = { ...contexte, profil: profilProjete };

    const { roadmap, notionsPreMaitrisees } =
      await this.deps.planification.genererRoadmap(contexte);

    graphe = grapheDepuisRoadmap(roadmap, contexte.domaine.id);
    // Réinjecte les compétences déjà résolues
    for (const noeud of this.lm.registre.lister(contexte.domaine.id)) {
      graphe = this.lm.graphe.ajouterNoeud(graphe, noeud);
    }

    const profilFinal = appliquerMaitriseInitiale(
      profilProjete,
      notionsPreMaitrisees,
    );
    contexte = {
      ...contexte,
      roadmap,
      grapheCompetences: graphe,
      profil: profilFinal,
      modeleApprenant: modele,
    };

    await this.persiste(contexte);
    await this.persisteModele(modele);
    await this.persisteNiveauDomaine(contexte);

    const etatPret: EtatParcours = {
      contexte,
      phase: "pret",
      questionCourante: null,
      questionsPosees,
      historiqueMaitrise: historique,
    };

    return { termine: true, etat: etatPret };
  }

  private async persiste(contexte: ContexteApprentissage): Promise<void> {
    if (!this.deps.persistance) {
      return;
    }
    await this.deps.persistance.sauvegarderObjectif(contexte.objectif);
    await this.deps.persistance.sauvegarderProfil(contexte.profil);
    if (contexte.roadmap) {
      await this.deps.persistance.sauvegarderRoadmap(contexte.roadmap);
    }
  }

  private async persisteModele(modele: ModeleApprenant): Promise<void> {
    if (!this.deps.persistanceModele) {
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

  private async persisteNiveauDomaine(
    contexte: ContexteApprentissage,
  ): Promise<void> {
    if (!this.deps.persistance || contexte.profil.niveauEstime === null) {
      return;
    }
    const existant: ChampsProfilElevePersistes | null =
      await this.deps.persistance.chargerProfilEleve();
    const champs = existant ?? champsProfilEleveInitiaux();
    await this.deps.persistance.sauvegarderProfilEleve({
      ...champs,
      niveauxParDomaine: {
        ...champs.niveauxParDomaine,
        [contexte.domaine.id]: contexte.profil.niveauEstime,
      },
    });
  }
}
