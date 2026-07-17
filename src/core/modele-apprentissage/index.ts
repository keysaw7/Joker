export { creerLearningModel } from "./creerLearningModel";
export type { LearningModel } from "./creerLearningModel";
export { normaliserContexteApprentissage } from "./compatibilite";

export { creerMoteurObservation } from "./observation/moteurObservation";
export { creerMoteurInferenceBeta } from "./inference/moteurInferenceBeta";
export {
  FACTEUR_PROPAGATION,
  mettreAJourCroyanceBeta,
  succesDepuisMaitrise,
} from "./inference/beta";
export { creerServiceGrapheCompetences, grapheDepuisRoadmap } from "./graphe/grapheCompetences";
export { creerRegistreCompetencesMemoire } from "./graphe/registreCompetences";
export { creerMoteurIncertitude } from "./incertitude/moteurIncertitude";
export {
  creerMoteurRecommandation,
  guidageDepuisCroyance,
  guidageInitialDepuisModele,
} from "./recommandation/moteurRecommandation";
export { creerMoteurPrediction } from "./prediction/moteurPrediction";
export {
  maitriseAttendueGlobale,
  noeudEstProbablementMaitrise,
  projeterEstimationDepuisModele,
  projeterProfilApprenant,
  SEUIL_INCERTITUDE_MAX,
  SEUIL_MAITRISE_MOYENNE,
} from "./projections/projeterProfil";
export {
  faiblessesProbablesDepuisModele,
  forcesProbablesDepuisModele,
  formatsEfficacesDepuisModele,
} from "./projections/projeterProfilEleve";
