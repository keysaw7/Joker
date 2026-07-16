import type {
  BlocContenu,
  ContexteApprentissage,
  Cours,
  IntentionBloc,
  Notion,
} from "@/core/domain";
import type {
  ConcepteurDeCours,
  GenerateurGraphique,
  GenerateurImage,
  GenerateurSchema,
  PlanificateurCours,
  StockageAssets,
} from "@/core/ports";

export interface DependancesConcepteurDeCours {
  planificateurCours: PlanificateurCours;
  generateurImage: GenerateurImage;
  generateurSchema: GenerateurSchema;
  generateurGraphique: GenerateurGraphique;
  stockageAssets: StockageAssets;
}

function serialiserContexte(contexte: ContexteApprentissage, notion: Notion): string {
  return JSON.stringify({ domaine: contexte.domaine, objectif: contexte.objectif, notion });
}

export async function enrichirIntention(
  intention: IntentionBloc,
  deps: DependancesConcepteurDeCours,
  contexteSerialise: string,
  index: number,
): Promise<BlocContenu> {
  switch (intention.type) {
    case "texte":
      return intention;
    case "encadre":
      return intention;
    case "analogie":
      return intention;
    case "comparaison":
      return intention;
    case "tableau":
      return intention;
    case "etapes":
      return intention;
    case "quizFlash":
      return intention;
    case "schema": {
      try {
        const { mermaid } = await deps.generateurSchema.genererSchema({
          brief: intention.briefMedia,
          contexte: contexteSerialise,
        });
        return {
          type: "schema",
          mermaid,
          ...(intention.legende != null ? { legende: intention.legende } : {}),
        };
      } catch {
        return {
          type: "texte",
          markdown: `> Schéma indisponible.\n\n${intention.briefMedia}`,
        };
      }
    }
    case "graphique": {
      try {
        const graphique = await deps.generateurGraphique.genererGraphique({
          brief: intention.briefMedia,
          contexte: contexteSerialise,
        });
        return {
          type: "graphique",
          graphique,
          ...(intention.legende != null ? { legende: intention.legende } : {}),
        };
      } catch {
        return {
          type: "texte",
          markdown: `> Graphique indisponible.\n\n${intention.briefMedia}`,
        };
      }
    }
    case "image": {
      try {
        const image = await deps.generateurImage.genererImage({
          brief: intention.briefMedia,
          contexte: contexteSerialise,
        });
        const cle = `cours/${Date.now()}-${index}.${extensionDepuisMediaType(image.mediaType)}`;
        const asset = await deps.stockageAssets.televerser(
          image.bytes,
          image.mediaType,
          cle,
        );
        return {
          type: "image",
          assetId: asset.id,
          url: asset.url,
          alt: image.alt || intention.alt,
          briefGeneration: intention.briefMedia,
          ...(intention.legende != null ? { legende: intention.legende } : {}),
        };
      } catch {
        return {
          type: "texte",
          markdown: `> Illustration indisponible.\n\n*${intention.alt}*`,
        };
      }
    }
  }
}

function extensionDepuisMediaType(mediaType: string): string {
  if (mediaType.includes("png")) return "png";
  if (mediaType.includes("jpeg") || mediaType.includes("jpg")) return "jpg";
  if (mediaType.includes("webp")) return "webp";
  if (mediaType.includes("gif")) return "gif";
  return "bin";
}

export class ConcepteurDeCoursImpl implements ConcepteurDeCours {
  constructor(private readonly deps: DependancesConcepteurDeCours) {}

  async enrichirIntentions(
    contexte: ContexteApprentissage,
    notion: Notion,
    intentions: readonly IntentionBloc[],
  ): Promise<BlocContenu[]> {
    const contexteSerialise = serialiserContexte(contexte, notion);
    return Promise.all(
      intentions.map((intention, index) =>
        enrichirIntention(intention, this.deps, contexteSerialise, index),
      ),
    );
  }

  async composerCours(
    contexte: ContexteApprentissage,
    notion: Notion,
  ): Promise<Cours> {
    const plan = await this.deps.planificateurCours.genererPlanCours(contexte, notion);
    const blocs = await this.enrichirIntentions(contexte, notion, plan.intentions);

    return {
      notionId: notion.id,
      titre: plan.titre,
      blocs,
    };
  }
}

export function creerConcepteurDeCours(
  deps: DependancesConcepteurDeCours,
): ConcepteurDeCours {
  return new ConcepteurDeCoursImpl(deps);
}
