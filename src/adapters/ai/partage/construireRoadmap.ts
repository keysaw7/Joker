import type { Notion, Roadmap } from "@/core/domain";
import type { z } from "zod";
import type { schemaNotionSansIds, schemaRoadmapSansIds } from "./schemas";

type NotionGeneree = z.infer<typeof schemaNotionSansIds>;
type RoadmapGeneree = z.infer<typeof schemaRoadmapSansIds>;

export function construireRoadmapDepuisGeneration(
  objectifId: string,
  version: number,
  roadmapGeneree: RoadmapGeneree,
): Roadmap {
  const ids = roadmapGeneree.notions.map(() => crypto.randomUUID());

  const notions: Notion[] = roadmapGeneree.notions.map((notion, index) =>
    construireNotion(notion, ids, index),
  );

  return { objectifId, version, notions };
}

function construireNotion(
  notion: NotionGeneree,
  ids: string[],
  index: number,
): Notion {
  return {
    id: ids[index]!,
    titre: notion.titre,
    prerequisIds: notion.prerequisOrdres
      .filter((ordre) => ordre >= 0 && ordre < ids.length && ordre !== index)
      .map((ordre) => ids[ordre]!),
    objectifsPedagogiques: notion.objectifsPedagogiques,
    criteresDeMaitrise: notion.criteresDeMaitrise.map((critere) => ({
      id: crypto.randomUUID(),
      description: critere.description,
    })),
  };
}
