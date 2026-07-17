import type { Domaine } from "./domaine";
import type { EtatGrapheCompetences } from "./modele-apprentissage/graphe";
import type { ModeleApprenant } from "./modele-apprentissage/modeleApprenant";
import type { Objectif } from "./objectif";
import type {
  EstimationNiveau,
  ProfilApprenant,
  ReponseDiagnostic,
} from "./profil";
import type { Roadmap } from "./roadmap";

/**
 * Informations accumulées et réutilisées par les étapes du Cycle.
 * Chaque page consomme ce contexte ; la génération est just-in-time.
 *
 * `modeleApprenant` est la source de vérité probabiliste ;
 * `profil` / `estimationNiveau` sont des projections de compatibilité.
 */
export interface ContexteApprentissage {
  readonly domaine: Domaine;
  readonly objectif: Objectif;
  readonly profil: ProfilApprenant;
  readonly roadmap: Roadmap | null;
  readonly notionCouranteId: string | null;
  readonly reponsesDiagnostic: readonly ReponseDiagnostic[];
  readonly estimationNiveau: EstimationNiveau | null;
  /** Learning Model — absente uniquement pour les sessions legacy. */
  readonly modeleApprenant: ModeleApprenant | null;
  readonly grapheCompetences: EtatGrapheCompetences | null;
}
