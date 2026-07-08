import type {
  ContexteApprentissage,
  ProfilApprenant,
  Roadmap,
} from "@/core/domain";

/** Résultat de l'adaptation du parcours selon la progression réelle. */
export interface ResultatAdaptation {
  readonly profil: ProfilApprenant;
  readonly roadmap: Roadmap;
}

/**
 * Fait évoluer le profil et la roadmap en permanence
 * selon la progression réelle de l'élève.
 */
export interface Adaptation {
  adapter(contexte: ContexteApprentissage): Promise<ResultatAdaptation>;
}
