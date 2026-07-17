import type { FormatExercice, NiveauGuidage } from "../exercice";

export type ActionPedagogique =
  | { readonly type: "sonder_competence"; readonly noeudId: string; readonly difficulte: number }
  | { readonly type: "enseigner_notion"; readonly notionId: string }
  | {
      readonly type: "exercer";
      readonly notionId: string;
      readonly guidage: NiveauGuidage;
      readonly format?: FormatExercice;
    }
  | { readonly type: "remedier"; readonly erreurId: string }
  | { readonly type: "reviser"; readonly noeudId: string };

export interface ContraintesRecommandation {
  readonly notionsEligibles?: readonly string[];
  readonly notionsMaitrisees?: readonly string[];
  readonly budgetInteractionsRestant?: number;
  readonly phase?: "diagnostic" | "cycle" | "revision";
}

export interface PredictionTrajectory {
  readonly action: ActionPedagogique;
  readonly maitriseAttendueParNoeud: Readonly<Record<string, number>>;
  readonly incertitudeAttendueGlobale: number;
  readonly gainAttendu: number;
}
