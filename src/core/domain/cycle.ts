import type { ContexteApprentissage } from "./contexte";
import type { Cours, ExempleExpert, Problematique } from "./contenu";
import type {
  Correction,
  Exercice,
  NiveauGuidage,
} from "./exercice";

/** Étapes linéaires du cycle (5→9). */
export type EtapeCycle =
  | "problematique"
  | "cours"
  | "exempleExpert"
  | "exercices"
  | "recompense";

/** Contenu courant — union discriminée pour l'UI. */
export type ContenuEtape =
  | { type: "problematique"; problematique: Problematique }
  | { type: "cours"; cours: Cours }
  | { type: "exempleExpert"; exemple: ExempleExpert }
  | { type: "exercice"; exercice: Exercice; correctionPrecedente?: Correction }
  | { type: "recompense"; recompense: Recompense };

/** État de la boucle d'exercices (étape 8). */
export interface EtatExercices {
  readonly exerciceCourant: Exercice;
  readonly guidageActuel: NiveauGuidage;
  readonly tentatives: number;
  /** null = pas de remédiation en cours */
  readonly lacuneActive: string | null;
}

/** Récompense minimale (étape 9 — gamification enrichie plus tard). */
export interface Recompense {
  readonly notionId: string;
  readonly titre: string;
  readonly message: string;
}

/** État complet géré par l'orchestrateur du Cycle. */
export interface EtatCycle {
  readonly contexte: ContexteApprentissage;
  readonly etape: EtapeCycle;
  readonly contenu: ContenuEtape;
  readonly etatExercices: EtatExercices | null;
  readonly notionsMaitrisees: readonly string[];
  /** true quand toutes les notions de la roadmap sont maîtrisées */
  readonly termine: boolean;
}
