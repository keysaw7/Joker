import type {
  ContexteApprentissage,
  Domaine,
  EtatParcours,
  Objectif,
  ReponseDiagnostic,
} from "@/core/domain";
import type {
  Diagnostic,
  Persistance,
  PlanificationPedagogique,
} from "@/core/ports";
import { ajouterReponse, contexteInitial } from "./regles";

export interface DependancesParcours {
  diagnostic: Diagnostic;
  planification: PlanificationPedagogique;
  persistance?: Persistance;
}

export class OrchestrateurParcours {
  constructor(private readonly deps: DependancesParcours) {}

  async demarrer(domaine: Domaine, objectif: Objectif): Promise<EtatParcours> {
    const contexte = contexteInitial(domaine, objectif);
    const questions = await this.deps.diagnostic.genererQuestions(contexte);

    return {
      contexte,
      phase: "diagnostic",
      questions,
    };
  }

  async finaliserDiagnostic(
    etat: EtatParcours,
    reponses: readonly ReponseDiagnostic[],
  ): Promise<EtatParcours> {
    if (etat.phase !== "diagnostic") {
      throw new Error("finaliserDiagnostic n'est disponible qu'en phase diagnostic");
    }

    if (reponses.length !== etat.questions.length) {
      throw new Error("Nombre de réponses incorrect");
    }

    for (let i = 0; i < reponses.length; i++) {
      if (reponses[i]!.questionId !== etat.questions[i]!.id) {
        throw new Error("Les réponses ne correspondent pas aux questions");
      }
    }

    let contexte = etat.contexte;
    for (const reponse of reponses) {
      contexte = ajouterReponse(contexte, reponse);
    }

    const profil = await this.deps.diagnostic.construireProfil(contexte);
    contexte = { ...contexte, profil };

    const roadmap = await this.deps.planification.genererRoadmap(contexte);
    contexte = { ...contexte, roadmap };

    await this.persiste(contexte);

    return {
      contexte,
      phase: "pret",
      questions: [],
    };
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
}
