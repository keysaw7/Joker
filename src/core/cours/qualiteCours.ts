import type { IntentionBloc, PlanCours } from "@/core/domain";

const LONGUEUR_SUBSTANTIELLE_MIN = 200;
const NOMBRE_INTENTIONS_MIN = 5;

const MOTIF_PLAN_DE_COURS = /plan\s+de\s+cours/i;
const MOTIF_BLOC_NUMERO = /^Bloc\s*\d+\s*:/im;
const MOTIF_META_OBJECTIF = /^\s*Objectif\s*:/im;
const MOTIF_META_PUBLIC = /^\s*Public\s*:/im;
const MOTIF_META_STRUCTURE = /^\s*Structure\s*:/im;
const MOTIF_FICHES_PRATIQUES_SEULES =
  /(?:^|\n)\s*[-*]?\s*Fiche pratique\s*\d+\s*:/gi;

export interface EvaluationQualitePlan {
  readonly valide: boolean;
  readonly defauts: readonly string[];
  readonly score: number;
}

function longueurSubstantielle(intention: IntentionBloc): number {
  switch (intention.type) {
    case "texte":
      return intention.markdown.replace(/^#+\s*/gm, "").trim().length;
    case "encadre":
      return intention.markdown.trim().length;
    case "etapes":
      return intention.etapes.reduce(
        (total, etape) => total + etape.titre.length + etape.markdown.length,
        0,
      );
    default:
      return 0;
  }
}

function textesPlan(plan: PlanCours): string {
  const morceaux = [plan.titre];
  for (const intention of plan.intentions) {
    switch (intention.type) {
      case "texte":
      case "encadre":
        morceaux.push(intention.markdown);
        break;
      case "etapes":
        for (const etape of intention.etapes) {
          morceaux.push(etape.titre, etape.markdown);
        }
        break;
      default:
        break;
    }
  }
  return morceaux.join("\n");
}

function detecterMetaContenu(plan: PlanCours): string[] {
  const defauts: string[] = [];
  const corpus = textesPlan(plan);

  if (MOTIF_PLAN_DE_COURS.test(plan.titre)) {
    defauts.push("Le titre ressemble à un plan (« Plan de cours… ») au lieu d'un titre de leçon.");
  }
  if (MOTIF_PLAN_DE_COURS.test(corpus)) {
    defauts.push("Le contenu mentionne un « plan de cours » au lieu d'enseigner directement.");
  }
  if (MOTIF_BLOC_NUMERO.test(corpus)) {
    defauts.push("Des titres « Bloc N : » détectés — rédige des sections pédagogiques, pas un syllabus.");
  }
  if (
    MOTIF_META_OBJECTIF.test(corpus) ||
    MOTIF_META_PUBLIC.test(corpus) ||
    MOTIF_META_STRUCTURE.test(corpus)
  ) {
    defauts.push("Sections méta (Objectif / Public / Structure) interdites — enseigne le contenu.");
  }

  const fiches = corpus.match(MOTIF_FICHES_PRATIQUES_SEULES);
  if (fiches && fiches.length >= 2) {
    const sansFiches = corpus.replace(MOTIF_FICHES_PRATIQUES_SEULES, "").trim();
    if (sansFiches.length < LONGUEUR_SUBSTANTIELLE_MIN) {
      defauts.push(
        "Liste de « Fiches pratiques » sans contenu rédigé — développe chaque point dans le cours.",
      );
    }
  }

  for (const intention of plan.intentions) {
    if (intention.type !== "texte" && intention.type !== "encadre") continue;
    const md = intention.markdown;
    const fichesBloc = md.match(MOTIF_FICHES_PRATIQUES_SEULES);
    if (fichesBloc && fichesBloc.length >= 2) {
      const reste = md.replace(MOTIF_FICHES_PRATIQUES_SEULES, "").trim();
      if (reste.length < 120) {
        defauts.push(
          "Liste de « Fiches pratiques » sans contenu rédigé — développe chaque point dans le cours.",
        );
        break;
      }
    }
  }

  return defauts;
}

export function evaluerQualitePlan(plan: PlanCours): EvaluationQualitePlan {
  const defauts: string[] = [...detecterMetaContenu(plan)];

  if (plan.intentions.length < NOMBRE_INTENTIONS_MIN) {
    defauts.push(
      `Trop peu de blocs (${plan.intentions.length}) — minimum ${NOMBRE_INTENTIONS_MIN} blocs variés.`,
    );
  }

  const dernier = plan.intentions.at(-1);
  if (dernier?.type !== "quizFlash") {
    defauts.push("Le dernier bloc doit être un quizFlash de vérification.");
  }

  const blocsSubstantiels = plan.intentions.filter(
    (intention) => longueurSubstantielle(intention) >= LONGUEUR_SUBSTANTIELLE_MIN,
  );
  if (blocsSubstantiels.length < 2) {
    defauts.push(
      `Au moins 2 blocs textuels denses (≥ ${LONGUEUR_SUBSTANTIELLE_MIN} caractères) sont requis.`,
    );
  }

  const aUnMedia = plan.intentions.some(
    (intention) =>
      intention.type === "schema" ||
      intention.type === "graphique" ||
      intention.type === "image",
  );
  if (!aUnMedia) {
    defauts.push("Inclure au moins un schema, graphique ou image (briefMedia + alt pour image).");
  }

  const longueurTotale = plan.intentions.reduce(
    (total, intention) => total + longueurSubstantielle(intention),
    0,
  );
  const score = Math.max(0, 100 - defauts.length * 12 + Math.min(30, Math.floor(longueurTotale / 50)));

  return {
    valide: defauts.length === 0,
    defauts,
    score,
  };
}

export function choisirMeilleurPlan(a: PlanCours, b: PlanCours): PlanCours {
  const scoreA = evaluerQualitePlan(a).score;
  const scoreB = evaluerQualitePlan(b).score;
  return scoreA >= scoreB ? a : b;
}
