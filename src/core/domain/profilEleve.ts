import type { Lacune } from "./profil";

export type TypeMemoire = "visuelle" | "auditive" | "litteraire" | "kinesthesique";

/** Champs persistés, alimentés plus tard par l'IA. */
export interface ChampsProfilElevePersistes {
  readonly typeMemoire: TypeMemoire | null;
  readonly pointsForts: readonly string[];
  readonly pointsFaibles: readonly string[];
  readonly niveauxParDomaine: Readonly<Record<string, number>>;
}

export function champsProfilEleveInitiaux(): ChampsProfilElevePersistes {
  return {
    typeMemoire: null,
    pointsForts: [],
    pointsFaibles: [],
    niveauxParDomaine: {},
  };
}

export interface CompetenceDomaine {
  readonly domaineId: string;
  /** Niveau estimé par l'IA (0–100), null tant que non déterminé. */
  readonly niveau: number | null;
  readonly objectifsTotal: number;
  readonly notionsMaitrisees: number;
  readonly notionsTotal: number;
  readonly lacunes: readonly Lacune[];
  /** Points forts spécifiques au domaine, déterminés par l'IA plus tard. */
  readonly pointsForts: readonly string[];
}

/** Profil transversal de l'élève, agrégé depuis toutes les sessions. */
export interface ProfilEleve {
  readonly utilisateurId: string;
  readonly email: string | null;
  readonly typeMemoire: TypeMemoire | null;
  readonly pointsForts: readonly string[];
  readonly pointsFaibles: readonly string[];
  readonly preferencesPedagogiques: readonly string[];
  readonly competencesParDomaine: readonly CompetenceDomaine[];
  readonly miseAJour: string;
}
