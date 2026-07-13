"use server";

import type { SelectionModele } from "@/adapters/ai/fournisseurs";
import { normaliserSelection } from "@/adapters/ai/fournisseurs";
import type { ContexteApprentissage, EtatCycle, EtatParcours } from "@/core/domain";
import { trouverDomaine } from "./_data/domaines";
import { creerCycle, creerParcours } from "./_serveur/moteur";

export async function demarrerParcours(
  domaineId: string,
  intitule: string,
  selection: SelectionModele,
): Promise<EtatParcours> {
  const domaine = trouverDomaine(domaineId);
  if (!domaine) {
    throw new Error(`Domaine « ${domaineId} » introuvable`);
  }

  const objectif = {
    id: crypto.randomUUID(),
    domaineId: domaine.id,
    intitule: intitule.trim(),
    creeLe: new Date().toISOString(),
  };

  return creerParcours(normaliserSelection(selection)).demarrer(domaine, objectif);
}

export async function repondreDiagnostic(
  etat: EtatParcours,
  texte: string,
  selection: SelectionModele,
): Promise<EtatParcours> {
  if (!etat.questionCourante) {
    throw new Error("Aucune question en cours");
  }

  return creerParcours(normaliserSelection(selection)).repondre(etat, {
    questionId: etat.questionCourante.id,
    reponse: texte.trim(),
  });
}

export async function demarrerCycle(
  contexte: ContexteApprentissage,
  selection: SelectionModele,
): Promise<EtatCycle> {
  return creerCycle(normaliserSelection(selection)).demarrer(contexte);
}

export async function avancerCycle(
  etat: EtatCycle,
  selection: SelectionModele,
): Promise<EtatCycle> {
  return creerCycle(normaliserSelection(selection)).avancer(etat);
}

export async function repondreExercice(
  etat: EtatCycle,
  texte: string,
  selection: SelectionModele,
): Promise<EtatCycle> {
  if (!etat.etatExercices) {
    throw new Error("Aucun exercice en cours");
  }

  return creerCycle(normaliserSelection(selection)).repondreExercice(etat, {
    exerciceId: etat.etatExercices.exerciceCourant.id,
    contenu: texte.trim(),
  });
}

export async function notionSuivante(
  etat: EtatCycle,
  selection: SelectionModele,
): Promise<EtatCycle> {
  return creerCycle(normaliserSelection(selection)).terminerEtPasserSuivant(etat);
}
