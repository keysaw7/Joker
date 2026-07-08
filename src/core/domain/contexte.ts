import type { Domaine } from "./domaine";
import type { Objectif } from "./objectif";
import type { ProfilApprenant, ReponseDiagnostic } from "./profil";
import type { Roadmap } from "./roadmap";

/**
 * Informations accumulées et réutilisées par les étapes du Cycle.
 * Chaque page consomme ce contexte ; la génération est just-in-time.
 */
export interface ContexteApprentissage {
  readonly domaine: Domaine;
  readonly objectif: Objectif;
  readonly profil: ProfilApprenant;
  readonly roadmap: Roadmap | null;
  readonly notionCouranteId: string | null;
  readonly reponsesDiagnostic: readonly ReponseDiagnostic[];
}
