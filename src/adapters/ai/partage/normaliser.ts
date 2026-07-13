import type { AnalyseReponse, BlocContenu, Exercice } from "@/core/domain";
import type { z } from "zod";
import type {
  schemaAnalyseReponse,
  schemaBlocContenu,
  schemaExerciceSansIds,
} from "./schemas";

type BlocGenere = z.infer<typeof schemaBlocContenu>;
type ExerciceGenere = z.infer<typeof schemaExerciceSansIds>;
type AnalyseGeneree = z.infer<typeof schemaAnalyseReponse>;

export function normaliserBloc(bloc: BlocGenere): BlocContenu {
  return {
    format: bloc.format,
    contenu: bloc.contenu,
    ...(bloc.legende != null ? { legende: bloc.legende } : {}),
  };
}

export function normaliserExercice(
  genere: ExerciceGenere,
  ids: { id: string; notionId: string },
): Exercice {
  return {
    id: ids.id,
    notionId: ids.notionId,
    enonce: genere.enonce,
    guidage: genere.guidage,
    ...(genere.cibleLacune != null ? { cibleLacune: genere.cibleLacune } : {}),
  };
}

export function normaliserAnalyse(analyse: AnalyseGeneree): AnalyseReponse {
  return {
    correcte: analyse.correcte,
    pourquoi: analyse.pourquoi,
    ...(analyse.connaissanceManquante != null
      ? { connaissanceManquante: analyse.connaissanceManquante }
      : {}),
    ...(analyse.confusion != null ? { confusion: analyse.confusion } : {}),
    ...(analyse.erreurCognitive != null
      ? { erreurCognitive: analyse.erreurCognitive }
      : {}),
  };
}
