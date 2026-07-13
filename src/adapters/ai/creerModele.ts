import type { LanguageModel } from "ai";
import { creerModeleAnthropic } from "./anthropic";
import { creerModeleGoogle } from "./google";
import { creerModeleOpenAI } from "./openai";
import type { SelectionModele } from "./fournisseurs";

/** Construit un LanguageModel à partir de la sélection fournisseur/modèle. */
export function creerModele(selection: SelectionModele): LanguageModel {
  switch (selection.fournisseur) {
    case "mock":
      throw new Error("Le fournisseur mock n'utilise pas de modèle IA.");
    case "anthropic":
      return creerModeleAnthropic(selection.modele);
    case "openai":
      return creerModeleOpenAI(selection.modele);
    case "google":
      return creerModeleGoogle(selection.modele);
    default: {
      const fournisseur: never = selection.fournisseur;
      throw new Error(`Fournisseur inconnu : ${fournisseur}`);
    }
  }
}
