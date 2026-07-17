import type {
  ContexteApprentissage,
  EtatParcours,
  Objectif,
  ReponseDiagnostic,
} from "@/core/domain";
import type { ChampsProfilElevePersistes } from "@/core/domain/profilEleve";
import { champsProfilEleveInitiaux } from "@/core/domain/profilEleve";
import type {
  Diagnostic,
  Persistance,
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
import type { Domaine } from "@/core/domain";

export interface DependancesParcours {
  diagnostic: Diagnostic;
  planification: PlanificationPedagogique;
  persistance?: Persistance;
}

export type ResultatReponseDiagnostic =
  | { readonly termine: false; readonly etat: EtatParcours }
  | { readonly termine: true; readonly etat: EtatParcours };

export class OrchestrateurParcours {
  constructor(private readonly deps: DependancesParcours) {}

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
    const estimationBase = contexte.estimationNiveau ?? {
      scoreGlobal: 0,
      competences: [],
      confiance: 0,
      evaluations: [],
    };
    const estimation = mettreAJourEstimation(
      estimationBase,
      question,
      evaluation,
      historique,
    );
    contexte = { ...contexte, estimationNiveau: estimation };

    const questionsPosees = etat.questionsPosees + 1;

    if (
      !diagnosticEstTermine(questionsPosees, estimation, historique)
    ) {
      const difficulteCible = prochaineDifficulte(
        question.difficulte,
        evaluation.maitrise,
      );
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

    const profil = await this.deps.diagnostic.construireProfil(contexte);
    const profilAvecNiveau = {
      ...profil,
      niveauEstime: estimation.scoreGlobal,
    };
    contexte = { ...contexte, profil: profilAvecNiveau };

    const { roadmap, notionsPreMaitrisees } =
      await this.deps.planification.genererRoadmap(contexte);
    contexte = { ...contexte, roadmap };

    const profilFinal = appliquerMaitriseInitiale(profilAvecNiveau, notionsPreMaitrisees);
    contexte = { ...contexte, profil: profilFinal };

    await this.persiste(contexte);
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
