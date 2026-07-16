import type {
  AnalyseReponse,
  Exercice,
  IntentionBloc,
  SpecGraphique,
  VarianteEncadre,
} from "@/core/domain";
import type { z } from "zod";
import type {
  schemaAnalyseReponse,
  schemaExerciceSansIds,
  schemaIntentionBloc,
  schemaSpecGraphique,
} from "./schemas";

type IntentionGeneree = z.infer<typeof schemaIntentionBloc>;
type SpecGraphiqueGeneree = z.infer<typeof schemaSpecGraphique>;
type ExerciceGenere = z.infer<typeof schemaExerciceSansIds>;
type AnalyseGeneree = z.infer<typeof schemaAnalyseReponse>;

function normaliserNullable<T>(valeur: T | null | undefined): T | undefined {
  return valeur ?? undefined;
}

function texteNonVide(valeur: string | null | undefined): string | null {
  if (valeur == null || valeur.trim() === "") return null;
  return valeur.trim();
}

function degraderEnTexte(intention: IntentionGeneree): IntentionBloc {
  const contenu = [
    intention.markdown,
    intention.question,
    intention.briefMedia,
    intention.explication,
    intention.source && intention.cible
      ? `${intention.source} → ${intention.cible}`
      : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    type: "texte",
    markdown: contenu || `_Contenu « ${intention.type} » incomplet — passage en texte._`,
  };
}

export function normaliserIntention(intention: IntentionGeneree): IntentionBloc {
  switch (intention.type) {
    case "texte": {
      const markdown = texteNonVide(intention.markdown);
      return markdown ? { type: "texte", markdown } : degraderEnTexte(intention);
    }
    case "encadre": {
      const markdown = texteNonVide(intention.markdown);
      const variante = intention.variante;
      if (!markdown || !variante) return degraderEnTexte(intention);
      return {
        type: "encadre",
        variante: variante as VarianteEncadre,
        markdown,
        ...(normaliserNullable(intention.titre) != null
          ? { titre: intention.titre! }
          : {}),
      };
    }
    case "analogie": {
      const source = texteNonVide(intention.source);
      const cible = texteNonVide(intention.cible);
      const explication = texteNonVide(intention.explication);
      if (!source || !cible || !explication) return degraderEnTexte(intention);
      return { type: "analogie", source, cible, explication };
    }
    case "comparaison": {
      if (!intention.entetes?.length || !intention.lignes?.length) {
        return degraderEnTexte(intention);
      }
      return {
        type: "comparaison",
        entetes: intention.entetes,
        lignes: intention.lignes,
      };
    }
    case "tableau": {
      if (!intention.entetes?.length || !intention.lignes?.length) {
        return degraderEnTexte(intention);
      }
      return {
        type: "tableau",
        entetes: intention.entetes,
        lignes: intention.lignes,
        ...(normaliserNullable(intention.legende) != null
          ? { legende: intention.legende! }
          : {}),
      };
    }
    case "schema": {
      const briefMedia = texteNonVide(intention.briefMedia);
      if (!briefMedia) return degraderEnTexte(intention);
      return {
        type: "schema",
        briefMedia,
        ...(normaliserNullable(intention.legende) != null
          ? { legende: intention.legende! }
          : {}),
      };
    }
    case "graphique": {
      const briefMedia = texteNonVide(intention.briefMedia);
      if (!briefMedia) return degraderEnTexte(intention);
      return {
        type: "graphique",
        briefMedia,
        ...(normaliserNullable(intention.legende) != null
          ? { legende: intention.legende! }
          : {}),
      };
    }
    case "image": {
      const briefMedia = texteNonVide(intention.briefMedia);
      const alt = texteNonVide(intention.alt);
      if (!briefMedia || !alt) return degraderEnTexte(intention);
      return {
        type: "image",
        briefMedia,
        alt,
        ...(normaliserNullable(intention.legende) != null
          ? { legende: intention.legende! }
          : {}),
      };
    }
    case "etapes": {
      if (!intention.etapes?.length) return degraderEnTexte(intention);
      return { type: "etapes", etapes: intention.etapes };
    }
    case "quizFlash": {
      const question = texteNonVide(intention.question);
      const options = intention.options?.map((o) => o.trim()).filter(Boolean);
      const bonneReponse = intention.bonneReponse;
      if (!question || !options || options.length < 2 || bonneReponse == null) {
        return degraderEnTexte(intention);
      }
      return {
        type: "quizFlash",
        question,
        options,
        bonneReponse,
        explication:
          texteNonVide(intention.explication) ??
          "Révoie ce point dans le cours pour approfondir.",
      };
    }
  }
}

export function normaliserSpecGraphique(spec: SpecGraphiqueGeneree): SpecGraphique {
  return {
    genre: spec.genre,
    series: spec.series,
    ...(normaliserNullable(spec.titre) != null ? { titre: spec.titre! } : {}),
    ...(normaliserNullable(spec.axeX) != null ? { axeX: spec.axeX! } : {}),
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
