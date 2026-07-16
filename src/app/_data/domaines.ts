import type { Domaine } from "@/core/domain";

interface DomaineAvecExemple extends Domaine {
  readonly exempleObjectif: string;
}

export const DOMAINES: readonly DomaineAvecExemple[] = [
  {
    id: "maths",
    nom: "Mathématiques",
    description: "Algèbre, analyse, géométrie…",
    exempleObjectif: "Ex. Comprendre les dérivées, Maîtriser les équations du second degré…",
  },
  {
    id: "japonais",
    nom: "Japonais",
    description: "Langue, écriture, culture…",
    exempleObjectif: "Ex. Réussir le JLPT N5, Apprendre à lire le hiragana…",
  },
  {
    id: "cuisine",
    nom: "Cuisine",
    description: "Techniques, recettes, saveurs…",
    exempleObjectif: "Ex. Maîtriser les bases de la pâtisserie, Cuisiner sans gluten…",
  },
  {
    id: "programmation",
    nom: "Programmation",
    description: "Code, architecture, outils…",
    exempleObjectif: "Ex. Comprendre les promesses en JavaScript, Apprendre React…",
  },
];

export function trouverDomaine(id: string): Domaine | undefined {
  return DOMAINES.find((d) => d.id === id);
}

export function placeholderObjectif(domaineId: string): string {
  return DOMAINES.find((d) => d.id === domaineId)?.exempleObjectif
    ?? "Ex. Définis ce que tu veux apprendre…";
}
