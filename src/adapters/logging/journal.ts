export type NiveauJournal = "debug" | "info" | "succes" | "erreur";

const COULEURS = {
  reset: "\x1b[0m",
  gris: "\x1b[90m",
  cyan: "\x1b[36m",
  vert: "\x1b[32m",
  jaune: "\x1b[33m",
  rouge: "\x1b[31m",
  bleu: "\x1b[34m",
} as const;

function journalActif(): boolean {
  const valeur = process.env.JOKER_LOG?.trim().toLowerCase();
  if (valeur === "0" || valeur === "false" || valeur === "off") {
    return false;
  }
  if (valeur === "1" || valeur === "true" || valeur === "on") {
    return true;
  }
  return process.env.NODE_ENV !== "production";
}

function couleurNiveau(niveau: NiveauJournal): string {
  switch (niveau) {
    case "debug":
      return COULEURS.gris;
    case "info":
      return COULEURS.cyan;
    case "succes":
      return COULEURS.vert;
    case "erreur":
      return COULEURS.rouge;
  }
}

function formaterTraceId(traceId: string | undefined): string {
  return traceId ? `[${traceauCourt(traceId)}]` : "[------]";
}

function traceauCourt(traceId: string): string {
  return traceId.slice(0, 6);
}

function formaterDetails(details?: Record<string, unknown>): string {
  if (!details || Object.keys(details).length === 0) return "";
  const parties = Object.entries(details)
    .filter(([, valeur]) => valeur !== undefined && valeur !== null)
    .map(([cle, valeur]) => `${cle}=${String(valeur)}`);
  return parties.length > 0 ? `  ${parties.join(" ")}` : "";
}

export function ecrireJournal(
  niveau: NiveauJournal,
  message: string,
  options: {
    traceId?: string;
    indentation?: number;
    details?: Record<string, unknown>;
  } = {},
): void {
  if (!journalActif()) return;

  const indentation = "  ".repeat(options.indentation ?? 0);
  const prefixe = formaterTraceId(options.traceId);
  const details = formaterDetails(options.details);
  const ligne = `${COULEURS.gris}${prefixe}${COULEURS.reset} ${indentation}${couleurNiveau(niveau)}${message}${COULEURS.reset}${details}`;

  if (niveau === "erreur") {
    console.error(ligne);
    return;
  }

  console.log(ligne);
}

export function journalActionDebut(
  nom: string,
  traceId: string,
  details?: Record<string, unknown>,
): void {
  ecrireJournal("info", `-> ${nom}`, { traceId, details });
}

export function journalActionFin(
  nom: string,
  traceId: string,
  dureeMs: number,
  erreur?: unknown,
): void {
  if (erreur) {
    const message =
      erreur instanceof Error ? erreur.message : String(erreur);
    ecrireJournal("erreur", `<- ${nom}  ${dureeMs}ms  ERREUR: ${message}`, {
      traceId,
    });
    return;
  }

  ecrireJournal("succes", `<- ${nom}  ${dureeMs}ms ok`, { traceId });
}

export function journalCapacite(
  nom: string,
  dureeMs: number,
  traceId?: string,
  erreur?: unknown,
): void {
  if (erreur) {
    const message =
      erreur instanceof Error ? erreur.message : String(erreur);
    ecrireJournal("erreur", `${nom}  ${dureeMs}ms  ERREUR: ${message}`, {
      traceId,
      indentation: 1,
    });
    return;
  }

  ecrireJournal("succes", `${nom}  ${dureeMs}ms ok`, {
    traceId,
    indentation: 1,
  });
}

export function journalIA(
  modele: string,
  etiquette: string,
  dureeMs: number,
  usage?: { inputTokens?: number; outputTokens?: number },
  traceId?: string,
  erreur?: unknown,
): void {
  const tokens =
    usage?.inputTokens != null || usage?.outputTokens != null
      ? `  tokens: ${usage.inputTokens ?? "?"} in / ${usage.outputTokens ?? "?"} out`
      : "";

  if (erreur) {
    const message =
      erreur instanceof Error ? erreur.message : String(erreur);
    ecrireJournal(
      "erreur",
      `IA ${modele} (${etiquette})  ${dureeMs}ms  ERREUR: ${message}`,
      { traceId, indentation: 1 },
    );
    return;
  }

  ecrireJournal(
    "info",
    `IA ${modele} (${etiquette})  ${dureeMs}ms${tokens}`,
    { traceId, indentation: 1 },
  );
}
