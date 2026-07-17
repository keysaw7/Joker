export type TypeNoeud = "competence" | "concept" | "notion" | "erreur_type";

export interface NoeudConnaissance {
  readonly id: string;
  readonly type: TypeNoeud;
  readonly libelle: string;
  readonly domaineId: string;
}

export type TypeRelation =
  | "prerequis_de"
  | "compose"
  | "evalue"
  | "transferable_vers"
  | "manifeste_erreur";

export interface RelationConnaissance {
  readonly de: string;
  readonly vers: string;
  readonly type: TypeRelation;
  readonly poids: number;
}

/** Snapshot sérialisable du graphe (état, pas comportement). */
export interface EtatGrapheCompetences {
  readonly domaineId: string;
  readonly noeuds: readonly NoeudConnaissance[];
  readonly relations: readonly RelationConnaissance[];
}

export function etatGrapheVide(domaineId: string): EtatGrapheCompetences {
  return { domaineId, noeuds: [], relations: [] };
}
