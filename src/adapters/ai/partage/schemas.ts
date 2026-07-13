import { z } from "zod";

export const schemaFormatContenu = z.enum([
  "texte",
  "image",
  "schema",
  "diagramme",
  "graphique",
  "tableau",
  "video",
  "animation",
  "simulation",
  "comparaison",
  "analogie",
]);

export const schemaFormeProblematique = z.enum([
  "question",
  "probleme",
  "defi",
  "situation",
  "objectif",
]);

export const schemaNiveauGuidage = z.enum(["fort", "modere", "autonome"]);

export const schemaBlocContenu = z.object({
  format: schemaFormatContenu,
  contenu: z.string(),
  legende: z.string().optional(),
});

export const schemaQuestionDiagnostic = z.object({
  intitule: z.string().min(1),
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
});

export const schemaRoadmapSansIds = z.object({
  notions: z.array(schemaNotionSansIds).min(1).max(12),
});

export const schemaProblematiqueSansNotionId = z.object({
  intitule: z.string(),
  forme: schemaFormeProblematique,
});

export const schemaCoursSansNotionId = z.object({
  titre: z.string(),
  blocs: z.array(schemaBlocContenu).min(1),
});

export const schemaExempleExpertSansNotionId = z.object({
  contexte: z.string(),
  demonstration: z.array(schemaBlocContenu).min(1),
});

export const schemaExerciceSansIds = z.object({
  enonce: z.string(),
  guidage: schemaNiveauGuidage,
  cibleLacune: z.string().optional(),
});

export const schemaAnalyseReponse = z.object({
  correcte: z.boolean(),
  pourquoi: z.string(),
  connaissanceManquante: z.string().optional(),
  confusion: z.string().optional(),
  erreurCognitive: z.string().optional(),
});

export const schemaCorrectionSansIds = z.object({
  explicationPersonnalisee: z.string(),
});

export const schemaResultatAdaptationSansIds = z.object({
  profil: schemaProfilSansIds,
  roadmap: schemaRoadmapSansIds,
});
