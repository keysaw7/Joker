import type { Notion, Roadmap } from "@/core/domain";
import type { z } from "zod";
import type { schemaNotionSansIds, schemaRoadmapSansIds } from "./schemas";

type NotionGeneree = z.infer<typeof schemaNotionSansIds>;
type RoadmapGeneree = z.infer<typeof schemaRoadmapSansIds>;

/**
 * Construit une roadmap à partir de la génération IA.
 * Si une roadmap précédente est fournie, les IDs des notions sont préservés
 * par correspondance de titre (critique pour archive / sidebar / progression).
 */
export function construireRoadmapDepuisGeneration(
  objectifId: string,
  version: number,
  roadmapGeneree: RoadmapGeneree,
  roadmapPrecedente?: Roadmap | null,
): Roadmap {
  const ids = roadmapGeneree.notions.map((notion) => {
    const existante = roadmapPrecedente?.notions.find(
      (n) => n.titre.trim().toLowerCase() === notion.titre.trim().toLowerCase(),
    );
    return existante?.id ?? crypto.randomUUID();
  });

  const notions: Notion[] = roadmapGeneree.notions.map((notion, index) =>
    construireNotion(notion, ids, index, roadmapPrecedente),
  );

  return { objectifId, version, notions };
}

function construireNotion(
  notion: NotionGeneree,
  ids: string[],
  index: number,
  roadmapPrecedente?: Roadmap | null,
): Notion {
  const id = ids[index]!;
  const precedente = roadmapPrecedente?.notions.find((n) => n.id === id);

  return {
    id,
    titre: notion.titre,
    prerequisIds: notion.prerequisOrdres
      .filter((ordre) => ordre >= 0 && ordre < ids.length && ordre !== index)
      .map((ordre) => ids[ordre]!),
    objectifsPedagogiques: notion.objectifsPedagogiques,
    criteresDeMaitrise: notion.criteresDeMaitrise.map((critere, critereIndex) => {
      const critereExistant = precedente?.criteresDeMaitrise[critereIndex];
      return {
        id: critereExistant?.id ?? crypto.randomUUID(),
        description: critere.description,
      };
    }),
  };
}
