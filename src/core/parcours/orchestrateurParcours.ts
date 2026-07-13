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
    const questionCourante = await this.deps.diagnostic.genererQuestion(contexte);

    return {
      contexte,
      phase: "diagnostic",
      questionCourante,
    };
  }

  async repondre(
    etat: EtatParcours,
    reponse: ReponseDiagnostic,
  ): Promise<EtatParcours> {
    if (etat.phase !== "diagnostic") {
      throw new Error("repondre n'est disponible qu'en phase diagnostic");
    }

    if (reponse.questionId !== etat.questionCourante?.id) {
      throw new Error("La réponse ne correspond pas à la question courante");
    }

    let contexte = ajouterReponse(etat.contexte, reponse);

    if (await this.deps.diagnostic.estTermine(contexte)) {
      const profil = await this.deps.diagnostic.construireProfil(contexte);
      contexte = { ...contexte, profil };

      const roadmap = await this.deps.planification.genererRoadmap(contexte);
      contexte = { ...contexte, roadmap };

      await this.persiste(contexte);

      return {
        contexte,
        phase: "pret",
        questionCourante: null,
      };
    }

    const questionCourante = await this.deps.diagnostic.genererQuestion(contexte);

    return {
      contexte,
      phase: "diagnostic",
      questionCourante,
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
