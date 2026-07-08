/**
 * Le diagnostic ne cherche pas à attribuer une note.
 * Il construit une représentation fidèle du niveau réel de l'élève.
 * Les questions sont générées dynamiquement (jamais fixes).
 */
export interface QuestionDiagnostic {
  readonly id: string;
  readonly intitule: string;
}

export interface ReponseDiagnostic {
  readonly questionId: string;
  readonly reponse: string;
}

export interface Lacune {
  readonly sujet: string;
  readonly description: string;
}

/**
 * Le profil d'apprenant est un état vivant : il est enrichi en continu
 * au fil de la progression (diagnostic, exercices, corrections).
 */
export interface ProfilApprenant {
  readonly objectifId: string;
  readonly acquis: readonly string[];
  readonly competences: readonly string[];
  readonly lacunes: readonly Lacune[];
  readonly erreursFrequentes: readonly string[];
  readonly preferencesPedagogiques: readonly string[];
  readonly miseAJour: string;
}
