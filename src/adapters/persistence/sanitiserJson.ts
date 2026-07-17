/**
 * PostgreSQL jsonb refuse les caractères NUL (\u0000) dans les chaînes.
 * Le contenu LLM (markdown, mermaid…) peut en contenir occasionnellement.
 */
export function sanitiserJsonPourPostgres<T>(valeur: T): T {
  return sanitiser(valeur) as T;
}

function sanitiser(valeur: unknown): unknown {
  if (typeof valeur === "string") {
    return valeur.split("\0").join("");
  }
  if (Array.isArray(valeur)) {
    return valeur.map(sanitiser);
  }
  if (valeur !== null && typeof valeur === "object") {
    const objet: Record<string, unknown> = {};
    for (const [cle, sousValeur] of Object.entries(valeur)) {
      objet[cle] = sanitiser(sousValeur);
    }
    return objet;
  }
  return valeur;
}
