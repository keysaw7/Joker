import type {
  EtatGrapheCompetences,
  NoeudConnaissance,
  Roadmap,
} from "@/core/domain";

/**
 * Requêtes et mutations immuables sur le graphe de compétences.
 */
export interface ServiceGrapheCompetences {
  noeud(etat: EtatGrapheCompetences, id: string): NoeudConnaissance | null;
  prerequis(etat: EtatGrapheCompetences, id: string): readonly string[];
  dependants(etat: EtatGrapheCompetences, id: string): readonly string[];
  chemin(
    etat: EtatGrapheCompetences,
    de: string,
    vers: string,
  ): readonly string[];
  fusionnerDepuisRoadmap(
    etat: EtatGrapheCompetences,
    roadmap: Roadmap,
    domaineId: string,
  ): EtatGrapheCompetences;
  ajouterNoeud(
    etat: EtatGrapheCompetences,
    noeud: NoeudConnaissance,
  ): EtatGrapheCompetences;
}
