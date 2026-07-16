import { beforeEach, describe, expect, it, vi } from "vitest";
import { creerConcepteurDeCours } from "@/core/cours/concepteurDeCours";
import type { ContexteApprentissage, IntentionBloc, Notion, Roadmap } from "@/core/domain";
import type {
  GenerateurGraphique,
  GenerateurImage,
  GenerateurSchema,
  PlanificateurCours,
  StockageAssets,
} from "@/core/ports";

function creerNotion(): Notion {
  return {
    id: "n1",
    titre: "Les dérivées",
    prerequisIds: [],
    objectifsPedagogiques: ["Comprendre la notion de taux de variation"],
    criteresDeMaitrise: [{ id: "c1", description: "Calculer une dérivée simple" }],
  };
}

function creerContexte(notion: Notion): ContexteApprentissage {
  const roadmap: Roadmap = {
    objectifId: "obj-1",
    version: 1,
    notions: [notion],
  };
  return {
    domaine: { id: "maths", nom: "Mathématiques" },
    objectif: {
      id: "obj-1",
      domaineId: "maths",
      intitule: "Comprendre les dérivées",
      creeLe: "2026-01-01T00:00:00.000Z",
    },
    profil: {
      objectifId: "obj-1",
      acquis: [],
      competences: [],
      lacunes: [],
      erreursFrequentes: [],
      preferencesPedagogiques: [],
      notionsMaitrisees: [],
      miseAJour: "2026-01-01T00:00:00.000Z",
    },
    roadmap,
    notionCouranteId: notion.id,
    reponsesDiagnostic: [],
  };
}

function creerPlan(intentions: IntentionBloc[]) {
  return {
    titre: "Cours test",
    intentions,
  };
}

describe("ConcepteurDeCours", () => {
  const notion = creerNotion();
  const contexte = creerContexte(notion);

  let planificateurCours: PlanificateurCours;
  let generateurSchema: GenerateurSchema;
  let generateurGraphique: GenerateurGraphique;
  let generateurImage: GenerateurImage;
  let stockageAssets: StockageAssets;

  beforeEach(() => {
    planificateurCours = {
      genererPlanCours: vi.fn().mockResolvedValue(
        creerPlan([
          { type: "texte", markdown: "Introduction" },
          { type: "schema", briefMedia: "Processus d'apprentissage" },
          { type: "graphique", briefMedia: "Données de progression" },
          {
            type: "image",
            briefMedia: "Illustration",
            alt: "Illustration pédagogique",
          },
        ]),
      ),
    };
    generateurSchema = {
      genererSchema: vi.fn().mockResolvedValue({
        mermaid: "flowchart TD\n  A --> B",
      }),
    };
    generateurGraphique = {
      genererGraphique: vi.fn().mockResolvedValue({
        genre: "barres",
        series: [
          {
            nom: "Série 1",
            points: [{ etiquette: "A", valeur: 10 }],
          },
        ],
      }),
    };
    generateurImage = {
      genererImage: vi.fn().mockResolvedValue({
        bytes: new Uint8Array([1, 2, 3]),
        mediaType: "image/png",
        alt: "test",
      }),
    };
    stockageAssets = {
      televerser: vi.fn().mockResolvedValue({
        id: "asset-1",
        url: "https://example.com/img.png",
        mediaType: "image/png",
      }),
    };
  });

  it("compose un cours en enrichissant les intentions média", async () => {
    const concepteur = creerConcepteurDeCours({
      planificateurCours,
      generateurSchema,
      generateurGraphique,
      generateurImage,
      stockageAssets,
    });

    const cours = await concepteur.composerCours(contexte, notion);

    expect(cours.titre).toBe("Cours test");
    expect(cours.notionId).toBe("n1");
    expect(cours.blocs).toHaveLength(4);
    expect(cours.blocs[0]).toEqual({ type: "texte", markdown: "Introduction" });
    expect(cours.blocs[1]?.type).toBe("schema");
    expect(cours.blocs[2]?.type).toBe("graphique");
    expect(cours.blocs[3]?.type).toBe("image");
    expect(generateurSchema.genererSchema).toHaveBeenCalledOnce();
    expect(generateurGraphique.genererGraphique).toHaveBeenCalledOnce();
    expect(generateurImage.genererImage).toHaveBeenCalledOnce();
    expect(stockageAssets.televerser).toHaveBeenCalledOnce();
  });

  it("dégrade gracieusement si un enrichissement média échoue", async () => {
    generateurSchema = {
      genererSchema: vi.fn().mockRejectedValue(new Error("échec schema")),
    };

    const concepteur = creerConcepteurDeCours({
      planificateurCours: {
        genererPlanCours: vi.fn().mockResolvedValue(
          creerPlan([{ type: "schema", briefMedia: "Schéma important" }]),
        ),
      },
      generateurSchema,
      generateurGraphique,
      generateurImage,
      stockageAssets,
    });

    const cours = await concepteur.composerCours(contexte, notion);

    expect(cours.blocs[0]?.type).toBe("texte");
    expect(cours.blocs[0]).toMatchObject({
      type: "texte",
      markdown: expect.stringContaining("Schéma indisponible"),
    });
  });
});
