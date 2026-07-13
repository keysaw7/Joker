export type IdFournisseur = "mock" | "anthropic" | "openai" | "google";

export interface ModeleFournisseur {
  readonly id: string;
  readonly nom: string;
}

export interface FournisseurIA {
  readonly id: IdFournisseur;
  readonly nom: string;
  readonly modeles: readonly ModeleFournisseur[];
}

export interface SelectionModele {
  readonly fournisseur: IdFournisseur;
  readonly modele: string;
}

export const FOURNISSEURS: readonly FournisseurIA[] = [
  {
    id: "mock",
    nom: "Mock (hors ligne)",
    modeles: [{ id: "mock", nom: "Développement hors ligne" }],
  },
  {
    id: "anthropic",
    nom: "Anthropic",
    modeles: [
      { id: "claude-sonnet-4-6", nom: "Claude Sonnet 4.6" },
      { id: "claude-opus-4-6", nom: "Claude Opus 4.6" },
      { id: "claude-haiku-4-5", nom: "Claude Haiku 4.5" },
    ],
  },
  {
    id: "openai",
    nom: "OpenAI",
    modeles: [
      { id: "gpt-4.1", nom: "GPT-4.1" },
      { id: "gpt-4.1-mini", nom: "GPT-4.1 Mini" },
      { id: "o4-mini", nom: "o4-mini" },
    ],
  },
  {
    id: "google",
    nom: "Google",
    modeles: [
      { id: "gemini-2.5-flash", nom: "Gemini 2.5 Flash" },
      { id: "gemini-2.5-pro", nom: "Gemini 2.5 Pro" },
    ],
  },
] as const;

export const SELECTION_DEFAUT: SelectionModele = {
  fournisseur: "mock",
  modele: "mock",
};

export function trouverFournisseur(id: IdFournisseur): FournisseurIA | undefined {
  return FOURNISSEURS.find((f) => f.id === id);
}

export function modeleValide(selection: SelectionModele): boolean {
  const fournisseur = trouverFournisseur(selection.fournisseur);
  if (!fournisseur) return false;
  return fournisseur.modeles.some((m) => m.id === selection.modele);
}

export function normaliserSelection(selection: SelectionModele): SelectionModele {
  if (modeleValide(selection)) return selection;

  const fournisseur = trouverFournisseur(selection.fournisseur) ?? FOURNISSEURS[0]!;
  return {
    fournisseur: fournisseur.id,
    modele: fournisseur.modeles[0]!.id,
  };
}
