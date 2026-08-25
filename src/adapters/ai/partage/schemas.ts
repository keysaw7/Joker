import { z } from "zod";

export const schemaGenreGraphique = z.enum(["barres", "lignes", "aire", "secteurs"]);

export const schemaPointGraphique = z.object({
  etiquette: z.string(),
  valeur: z.number(),
});

export const schemaSerieGraphique = z.object({
  nom: z.string(),
  points: z.array(schemaPointGraphique).min(1),
});

export const schemaSpecGraphique = z.object({
  genre: schemaGenreGraphique,
  titre: z.string().nullable(),
  axeX: z.string().nullable(),
  series: z.array(schemaSerieGraphique).min(1),
});

export const schemaFormeProblematique = z.enum([
  "question",
  "probleme",
  "defi",
  "situation",
  "objectif",
]);

export const schemaNiveauGuidage = z.enum(["fort", "modere", "autonome"]);

export const schemaVarianteEncadre = z.enum(["info", "attention", "astuce", "exemple"]);

export const schemaEtapeCours = z.object({
  titre: z.string(),
  markdown: z.string(),
});

export const schemaTypeIntentionBloc = z.enum([
  "texte",
  "encadre",
  "analogie",
  "comparaison",
  "tableau",
  "schema",
  "graphique",
  "image",
  "etapes",
  "quizFlash",
]);

export const schemaTypeIntentionExempleExpert = z.enum([
  "texte",
  "encadre",
  "analogie",
  "image",
]);

/** Schéma plat compatible OpenAI (pas de oneOf/discriminatedUnion). */
export const schemaIntentionBloc = z.object({
  type: schemaTypeIntentionBloc,
  markdown: z.string().nullable(),
  variante: schemaVarianteEncadre.nullable(),
  titre: z.string().nullable(),
  source: z.string().nullable(),
  cible: z.string().nullable(),
  explication: z.string().nullable(),
  entetes: z.array(z.string()).nullable(),
  lignes: z.array(z.array(z.string())).nullable(),
  legende: z.string().nullable(),
  briefMedia: z.string().nullable(),
  alt: z.string().nullable(),
  etapes: z.array(schemaEtapeCours).nullable(),
  question: z.string().nullable(),
  options: z.array(z.string()).nullable(),
  bonneReponse: z.number().int().nonnegative().nullable(),
});

/** Intentions restreintes pour l'exemple d'expert (pas de contenu didactique de cours). */
export const schemaIntentionExempleExpert = schemaIntentionBloc.extend({
  type: schemaTypeIntentionExempleExpert,
});

export const schemaPlanCours = z.object({
  titre: z.string(),
  intentions: z.array(schemaIntentionBloc).min(3).max(12),
});

export const schemaMermaid = z.object({
  mermaid: z.string(),
});

export const schemaQuestionDiagnosticGeneree = z.object({
  intitule: z.string().min(1),
  competenceId: z.string().min(1),
  competenceLibelle: z.string().min(1),
  difficulte: z.number().int().min(1).max(5),
});

export const schemaMaitriseDiagnostic = z.enum(["maitrise", "partiel", "absent"]);

export const schemaEvaluationDiagnostic = z.object({
  maitrise: schemaMaitriseDiagnostic,
  justification: z.string().min(1),
  lacuneDetectee: z.string().nullable(),
});

/** @deprecated Lot fixe — conservé pour compatibilité tests legacy si besoin */
export const schemaQuestionDiagnostic = z.object({
  intitule: z.string().min(1),
});

/** @deprecated */
export const schemaQuestionsDiagnostic = z.object({
  questions: z.array(schemaQuestionDiagnostic).length(5),
});

export const schemaLacune = z.object({
  sujet: z.string(),
  description: z.string(),
});

export const schemaProfilSansIds = z.object({
  acquis: z.array(z.string()),
  competences: z.array(z.string()),
  lacunes: z.array(schemaLacune),
  erreursFrequentes: z.array(z.string()),
  preferencesPedagogiques: z.array(z.string()),
  notionsMaitrisees: z.array(z.string()),
});

export const schemaCritereSansId = z.object({
  description: z.string(),
});

export const schemaNotionSansIds = z.object({
  titre: z.string(),
  prerequisOrdres: z.array(z.number().int().nonnegative()),
  objectifsPedagogiques: z.array(z.string()).min(1),
  criteresDeMaitrise: z.array(schemaCritereSansId).min(1),
  maitriseInitiale: z.boolean(),
});

export const schemaRoadmapSansIds = z.object({
  notions: z.array(schemaNotionSansIds).min(1).max(12),
});

export const schemaCasDusage = z.object({
  titre: z.string(),
  description: z.string(),
});

export const schemaProblematiqueSansNotionId = z.object({
  intitule: z.string(),
  forme: schemaFormeProblematique,
  casDusage: z.array(schemaCasDusage).min(3).max(6),
});

export const schemaExempleExpertSansNotionId = z.object({
  contexte: z.string(),
  intentions: z.array(schemaIntentionExempleExpert).min(3).max(5),
});

export const schemaFormatExercice = z.enum([
  "qcm",
  "trous",
  "appariement",
  "production_libre",
]);

const schemaPhraseATrous = z.object({
  id: z.string(),
  texteAvecTrous: z.string(),
  solutions: z.array(z.string()).min(1),
});

const schemaPaireAppariement = z.object({
  id: z.string(),
  gauche: z.string(),
  droite: z.string(),
});

const schemaExerciceCommun = {
  consigne: z.string(),
  guidage: schemaNiveauGuidage,
  cibleLacune: z.string().nullable(),
};

/**
 * Schéma plat compatible OpenAI structured outputs
 * (pas de oneOf / discriminatedUnion — même pattern que schemaIntentionBloc).
 * Préférer `schemaExercicePourFormat` à la génération : le format est connu
 * et les champs requis sont alors imposés au modèle.
 */
export const schemaExerciceSansIds = z.object({
  format: schemaFormatExercice,
  ...schemaExerciceCommun,
  question: z.string().nullable(),
  options: z.array(z.string()).nullable(),
  bonneReponse: z.number().int().nonnegative().nullable(),
  phrases: z.array(schemaPhraseATrous).nullable(),
  paires: z.array(schemaPaireAppariement).nullable(),
  distracteurs: z.array(z.string()).nullable(),
  enonce: z.string().nullable(),
  criteres: z.array(z.string()).nullable(),
  aide: z.string().nullable(),
});

export const schemaExerciceQcm = z.object({
  format: z.literal("qcm"),
  ...schemaExerciceCommun,
  question: z.string().min(1),
  options: z.array(z.string().min(1)).min(2).max(6),
  bonneReponse: z.number().int().nonnegative(),
});

export const schemaExerciceTrous = z.object({
  format: z.literal("trous"),
  ...schemaExerciceCommun,
  phrases: z.array(schemaPhraseATrous).min(1),
});

export const schemaExerciceAppariement = z.object({
  format: z.literal("appariement"),
  ...schemaExerciceCommun,
  paires: z.array(schemaPaireAppariement).min(2),
  distracteurs: z.array(z.string()).nullable(),
});

export const schemaExerciceProductionLibre = z.object({
  format: z.literal("production_libre"),
  ...schemaExerciceCommun,
  enonce: z.string().min(1),
  criteres: z.array(z.string()).nullable(),
  aide: z.string().nullable(),
});

export type FormatExerciceSchema = z.infer<typeof schemaFormatExercice>;

export type ExerciceStructureSelonFormat =
  | z.infer<typeof schemaExerciceQcm>
  | z.infer<typeof schemaExerciceTrous>
  | z.infer<typeof schemaExerciceAppariement>
  | z.infer<typeof schemaExerciceProductionLibre>;

/** Schéma d'exercice pour un format connu — sans oneOf, champs hors format omis. */
export function schemaExercicePourFormat(
  format: FormatExerciceSchema,
): z.ZodType<ExerciceStructureSelonFormat> {
  switch (format) {
    case "qcm":
      return schemaExerciceQcm;
    case "trous":
      return schemaExerciceTrous;
    case "appariement":
      return schemaExerciceAppariement;
    case "production_libre":
      return schemaExerciceProductionLibre;
    default: {
      const _inexhaustif: never = format;
      throw new Error(`Format d'exercice inconnu : ${String(_inexhaustif)}`);
    }
  }
}

export const schemaAnalyseReponse = z.object({
  correcte: z.boolean(),
  pourquoi: z.string(),
  connaissanceManquante: z.string().nullable(),
  confusion: z.string().nullable(),
  erreurCognitive: z.string().nullable(),
});

export const schemaCorrectionSansIds = z.object({
  resume: z.string(),
  pointsForts: z.array(z.string()).nullable(),
  aRetravailler: z.array(z.string()).nullable(),
});

export const schemaResultatAdaptationSansIds = z.object({
  profil: schemaProfilSansIds,
  roadmap: schemaRoadmapSansIds,
});
