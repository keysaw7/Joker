import { describe, expect, it } from "vitest";
import type { Roadmap } from "@/core/domain";
import {
  construireRoadmapDepuisGeneration,
  notionsPreMaitriseesDepuisGeneration,
} from "./construireRoadmap";

describe("construireRoadmapDepuisGeneration", () => {
  it("génère de nouveaux IDs sans roadmap précédente", () => {
    const roadmap = construireRoadmapDepuisGeneration("obj-1", 1, {
      notions: [
        {
          titre: "Salutations",
          prerequisOrdres: [],
          objectifsPedagogiques: ["Saluer en japonais"],
          criteresDeMaitrise: [{ description: "Saluer correctement" }],
          maitriseInitiale: false,
        },
      ],
    });

    expect(roadmap.notions).toHaveLength(1);
    expect(roadmap.notions[0]?.id).toBeTruthy();
    expect(roadmap.notions[0]?.titre).toBe("Salutations");
  });

  it("préserve les IDs des notions existantes par titre (archive / sidebar)", () => {
    const precedente: Roadmap = {
      objectifId: "obj-1",
      version: 1,
      notions: [
        {
          id: "notion-salutations-stable",
          titre: "Salutations",
          prerequisIds: [],
          objectifsPedagogiques: ["Saluer en japonais"],
          criteresDeMaitrise: [
            { id: "crit-1", description: "Saluer correctement" },
          ],
        },
        {
          id: "notion-hiragana",
          titre: "Hiragana",
          prerequisIds: ["notion-salutations-stable"],
          objectifsPedagogiques: ["Lire le hiragana"],
          criteresDeMaitrise: [{ id: "crit-2", description: "Lire あいう" }],
        },
      ],
    };

    const adaptee = construireRoadmapDepuisGeneration(
      "obj-1",
      2,
      {
        notions: [
          {
            titre: "Salutations",
            prerequisOrdres: [],
            objectifsPedagogiques: ["Saluer en japonais"],
            criteresDeMaitrise: [{ description: "Saluer correctement" }],
          maitriseInitiale: false,
          },
          {
            titre: "Hiragana",
            prerequisOrdres: [0],
            objectifsPedagogiques: ["Lire le hiragana"],
            criteresDeMaitrise: [{ description: "Lire あいう" }],
            maitriseInitiale: false,
          },
          {
            titre: "Particules de base",
            prerequisOrdres: [1],
            objectifsPedagogiques: ["Utiliser は et が"],
            criteresDeMaitrise: [{ description: "Phrase simple" }],
            maitriseInitiale: false,
          },
        ],
      },
      precedente,
    );

    expect(adaptee.notions[0]?.id).toBe("notion-salutations-stable");
    expect(adaptee.notions[1]?.id).toBe("notion-hiragana");
    expect(adaptee.notions[1]?.prerequisIds).toEqual(["notion-salutations-stable"]);
    expect(adaptee.notions[2]?.titre).toBe("Particules de base");
    expect(adaptee.notions[2]?.id).not.toBe("notion-salutations-stable");
    expect(adaptee.notions[0]?.criteresDeMaitrise[0]?.id).toBe("crit-1");
  });
});

describe("notionsPreMaitriseesDepuisGeneration", () => {
  it("ignore maitriseInitiale true (pas de pré-maîtrise LLM)", () => {
    const generee = {
      notions: [
        {
          titre: "Salutations",
          prerequisOrdres: [],
          objectifsPedagogiques: ["Saluer en japonais"],
          criteresDeMaitrise: [{ description: "Saluer" }],
          maitriseInitiale: true,
        },
        {
          titre: "Hiragana",
          prerequisOrdres: [0],
          objectifsPedagogiques: ["Lire le hiragana"],
          criteresDeMaitrise: [{ description: "Lire あ" }],
          maitriseInitiale: false,
        },
      ],
    };
    const roadmap = construireRoadmapDepuisGeneration("obj-1", 1, generee);
    expect(notionsPreMaitriseesDepuisGeneration(generee, roadmap)).toEqual([]);
  });
});
