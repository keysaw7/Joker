/**
 * Fragment de connaissance issu de la Bible du domaine (ou du fallback).
 * L'IA sélectionne et adapte ces fragments — elle ne les invente pas.
 */
export interface FragmentConnaissance {
  readonly sujet: string;
  readonly contenu: string;
  readonly prerequis?: readonly string[];
}
