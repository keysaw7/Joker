import { AsyncLocalStorage } from "node:async_hooks";
import { journalActionDebut, journalActionFin } from "./journal";

interface ContexteTrace {
  readonly traceId: string;
}

const stockageTrace = new AsyncLocalStorage<ContexteTrace>();

export function traceIdCourant(): string | undefined {
  return stockageTrace.getStore()?.traceId;
}

export async function avecTrace<T>(
  nom: string,
  fn: () => Promise<T>,
  details?: Record<string, unknown>,
): Promise<T> {
  const traceId = crypto.randomUUID();
  const debut = performance.now();

  journalActionDebut(nom, traceId, details);

  return stockageTrace.run({ traceId }, async () => {
    try {
      const resultat = await fn();
      journalActionFin(nom, traceId, Math.round(performance.now() - debut));
      return resultat;
    } catch (erreur) {
      journalActionFin(nom, traceId, Math.round(performance.now() - debut), erreur);
      throw erreur;
    }
  });
}
