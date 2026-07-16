import { describe, expect, it } from "vitest";
import type { Roadmap } from "@/core/domain";
import { construireRoadmapDepuisGeneration } from "./construireRoadmap";

describe("construireRoadmapDepuisGeneration", () => {
  it("génère de nouveaux IDs sans roadmap précédente", () => {
    const roadmap = construireRoadmapDepuisGeneration("obj-1", 1, {
      notions: [
        {
          titre: "Pâte",
          prerequisOrdres: [],
          objectifsPedagogiques: ["Maîtriser la pâte"],
          criteresDeMaitrise: [{ description: "Pétrir correctement" }],
        },
      ],
    });

    expect(roadmap.notions).toHaveLength(1);
    expect(roadmap.notions[0]?.id).toBeTruthy();
    expect(roadmap.notions[0]?.titre).toBe("Pâte");
  });

  it("préserve les IDs des notions existantes par titre (archive / sidebar)", () => {
    const precedente: Roadmap = {
      objectifId: "obj-1",
      version: 1,
      notions: [
        {
          id: "notion-pate-stable",
          titre: "Pâte",
          prerequisIds: [],
          objectifsPedagogiques: ["Maîtriser la pâte"],
          criteresDeMaitrise: [
            { id: "crit-1", description: "Pétrir correctement" },
          ],
        },
        {
          id: "notion-cuisson",
          titre: "Cuisson",
          prerequisIds: ["notion-pate-stable"],
          objectifsPedagogiques: ["Cuire"],
          criteresDeMaitrise: [{ id: "crit-2", description: "Cuire juste" }],
        },
      ],
    };

    const adaptee = construireRoadmapDepuisGeneration(
      "obj-1",
      2,
      {
        notions: [
          {
            titre: "Pâte",
            prerequisOrdres: [],
            objectifsPedagogiques: ["Maîtriser la pâte"],
            criteresDeMaitrise: [{ description: "Pétrir correctement" }],
          },
          {
            titre: "Cuisson",
            prerequisOrdres: [0],
            objectifsPedagogiques: ["Cuire au four"],
            criteresDeMaitrise: [{ description: "Cuire juste" }],
          },
          {
            titre: "Garniture",
            prerequisOrdres: [1],
            objectifsPedagogiques: ["Garnir"],
            criteresDeMaitrise: [{ description: "Équilibrer" }],
          },
        ],
      },
      precedente,
    );

    expect(adaptee.notions[0]?.id).toBe("notion-pate-stable");
    expect(adaptee.notions[1]?.id).toBe("notion-cuisson");
    expect(adaptee.notions[1]?.prerequisIds).toEqual(["notion-pate-stable"]);
    expect(adaptee.notions[2]?.titre).toBe("Garniture");
    expect(adaptee.notions[2]?.id).not.toBe("notion-pate-stable");
    expect(adaptee.notions[0]?.criteresDeMaitrise[0]?.id).toBe("crit-1");
  });
});
