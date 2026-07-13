import type { Domaine } from "@/core/domain";

export const DOMAINES: readonly Domaine[] = [
  { id: "maths", nom: "Mathématiques", description: "Algèbre, analyse, géométrie…" },
  { id: "japonais", nom: "Japonais", description: "Langue, écriture, culture…" },
  { id: "cuisine", nom: "Cuisine", description: "Techniques, recettes, saveurs…" },
  { id: "programmation", nom: "Programmation", description: "Code, architecture, outils…" },
];

export function trouverDomaine(id: string): Domaine | undefined {
  return DOMAINES.find((d) => d.id === id);
}
