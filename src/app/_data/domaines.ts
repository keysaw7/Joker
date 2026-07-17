import type { Domaine } from "@/core/domain";

interface DomaineAvecExemple extends Domaine {
  readonly exempleObjectif: string;
}

export const DOMAINES: readonly DomaineAvecExemple[] = [
  {
    id: "japonais",
    nom: "Japonais",
    description: "Langue, écriture, culture…",
    exempleObjectif: "Ex. Réussir le JLPT N5, Apprendre à lire le hiragana…",
  },
];

export function trouverDomaine(id: string): Domaine | undefined {
  return DOMAINES.find((d) => d.id === id);
}

export function placeholderObjectif(domaineId: string): string {
  return DOMAINES.find((d) => d.id === domaineId)?.exempleObjectif
    ?? "Ex. Définis ce que tu veux apprendre…";
}
