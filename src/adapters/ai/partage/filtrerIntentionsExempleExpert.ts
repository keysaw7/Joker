import {
  TYPES_BLOC_EXEMPLE_EXPERT,
  type IntentionBloc,
  type Notion,
  type TypeBlocExempleExpert,
} from "@/core/domain";

const TYPES_AUTORISES = new Set<TypeBlocExempleExpert>(TYPES_BLOC_EXEMPLE_EXPERT);

export function estIntentionExempleExpertPermise(
  intention: IntentionBloc,
): intention is IntentionBloc & { type: TypeBlocExempleExpert } {
  return TYPES_AUTORISES.has(intention.type as TypeBlocExempleExpert);
}

export function filtrerIntentionsExempleExpert(
  intentions: readonly IntentionBloc[],
  options?: { onRejet?: (intention: IntentionBloc) => void },
): IntentionBloc[] {
  return intentions.filter((intention) => {
    if (estIntentionExempleExpertPermise(intention)) return true;
    options?.onRejet?.(intention);
    return false;
  });
}

export function intentionsExempleExpertFallback(notion: Notion): IntentionBloc[] {
  return [
    {
      type: "texte",
      markdown: `Un expert utilise « ${notion.titre} » pour résoudre un problème concret.`,
    },
    {
      type: "encadre",
      variante: "exemple",
      titre: "En pratique",
      markdown: "Voici comment un professionnel raisonne étape par étape.",
    },
  ];
}

export function assurerIntentionsExempleExpert(
  intentions: readonly IntentionBloc[],
  notion: Notion,
  options?: { onRejet?: (intention: IntentionBloc) => void },
): IntentionBloc[] {
  const filtrees = filtrerIntentionsExempleExpert(intentions, options);
  if (filtrees.length >= 1) return filtrees;
  return intentionsExempleExpertFallback(notion);
}
