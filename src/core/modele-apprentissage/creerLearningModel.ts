import type {
  MoteurInference,
  MoteurIncertitude,
  MoteurObservation,
  MoteurPrediction,
  MoteurRecommandation,
  RegistreCompetences,
  ServiceGrapheCompetences,
} from "@/core/ports";
import { creerServiceGrapheCompetences } from "./graphe/grapheCompetences";
import { creerRegistreCompetencesMemoire } from "./graphe/registreCompetences";
import { creerMoteurInferenceBeta } from "./inference/moteurInferenceBeta";
import { creerMoteurIncertitude } from "./incertitude/moteurIncertitude";
import { creerMoteurObservation } from "./observation/moteurObservation";
import { creerMoteurPrediction } from "./prediction/moteurPrediction";
import { creerMoteurRecommandation } from "./recommandation/moteurRecommandation";

export interface LearningModel {
  readonly observation: MoteurObservation;
  readonly inference: MoteurInference;
  readonly graphe: ServiceGrapheCompetences;
  readonly registre: RegistreCompetences;
  readonly incertitude: MoteurIncertitude;
  readonly recommandation: MoteurRecommandation;
  readonly prediction: MoteurPrediction;
}

/** Composition root du Learning Model V0 (cœur pur, sans IA ni BDD). */
export function creerLearningModel(
  overrides: Partial<LearningModel> = {},
): LearningModel {
  const incertitude = overrides.incertitude ?? creerMoteurIncertitude();
  return {
    observation: overrides.observation ?? creerMoteurObservation(),
    inference: overrides.inference ?? creerMoteurInferenceBeta(),
    graphe: overrides.graphe ?? creerServiceGrapheCompetences(),
    registre: overrides.registre ?? creerRegistreCompetencesMemoire(),
    incertitude,
    recommandation:
      overrides.recommandation ?? creerMoteurRecommandation(incertitude),
    prediction: overrides.prediction ?? creerMoteurPrediction(),
  };
}
