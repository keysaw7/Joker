/** Ajoute une transcription à la valeur existante du champ. */
export function fusionnerTexteSaisie(
  valeurActuelle: string,
  transcription: string,
): string {
  const ajout = transcription.trim();
  if (!ajout) return valeurActuelle;
  const base = valeurActuelle.trimEnd();
  if (!base) return ajout;
  return `${base} ${ajout}`;
}
