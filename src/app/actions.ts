"use server";

import type { SelectionModele } from "@/adapters/ai/fournisseurs";
import { normaliserSelection } from "@/adapters/ai/fournisseurs";
import { avecTrace } from "@/adapters/logging/contexteTrace";
import type { ContexteApprentissage, EtatCycle, EtatParcours } from "@/core/domain";
import { trouverDomaine } from "./_data/domaines";
import { creerCycle, creerParcours } from "./_serveur/moteur";

function libelleModele(selection: SelectionModele): string {
  return `${selection.fournisseur}/${selection.modele}`;
}

export async function demarrerParcours(
  domaineId: string,
  intitule: string,
  selection: SelectionModele,
): Promise<EtatParcours> {
  return avecTrace(
    "demarrerParcours",
    async () => {
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
    },
    {
      domaine: domaineId,
      intitule: intitule.trim(),
      modele: libelleModele(normaliserSelection(selection)),
    },
  );
}

export async function repondreDiagnostic(
  etat: EtatParcours,
  texte: string,
  selection: SelectionModele,
): Promise<EtatParcours> {
  return avecTrace(
    "repondreDiagnostic",
    async () => {
      if (!etat.questionCourante) {
        throw new Error("Aucune question en cours");
      }

      return creerParcours(normaliserSelection(selection)).repondre(etat, {
        questionId: etat.questionCourante.id,
        reponse: texte.trim(),
      });
    },
    {
      objectifId: etat.contexte.objectif.id,
      phase: etat.phase,
      reponses: etat.contexte.reponsesDiagnostic.length + 1,
      modele: libelleModele(normaliserSelection(selection)),
    },
  );
}

export async function demarrerCycle(
  contexte: ContexteApprentissage,
  selection: SelectionModele,
): Promise<EtatCycle> {
  return avecTrace(
    "demarrerCycle",
    () => creerCycle(normaliserSelection(selection)).demarrer(contexte),
    {
      objectifId: contexte.objectif.id,
      notions: contexte.roadmap?.notions.length ?? 0,
      modele: libelleModele(normaliserSelection(selection)),
    },
  );
}

export async function avancerCycle(
  etat: EtatCycle,
  selection: SelectionModele,
): Promise<EtatCycle> {
  return avecTrace(
    "avancerCycle",
    () => creerCycle(normaliserSelection(selection)).avancer(etat),
    {
      objectifId: etat.contexte.objectif.id,
      etape: etat.etape,
      notionId: etat.contexte.notionCouranteId ?? undefined,
      modele: libelleModele(normaliserSelection(selection)),
    },
  );
}

export async function repondreExercice(
  etat: EtatCycle,
  texte: string,
  selection: SelectionModele,
): Promise<EtatCycle> {
  return avecTrace(
    "repondreExercice",
    async () => {
      if (!etat.etatExercices) {
        throw new Error("Aucun exercice en cours");
      }

      return creerCycle(normaliserSelection(selection)).repondreExercice(etat, {
        exerciceId: etat.etatExercices.exerciceCourant.id,
        contenu: texte.trim(),
      });
    },
    {
      objectifId: etat.contexte.objectif.id,
      exerciceId: etat.etatExercices?.exerciceCourant.id,
      guidage: etat.etatExercices?.guidageActuel,
      modele: libelleModele(normaliserSelection(selection)),
    },
  );
}

export async function notionSuivante(
  etat: EtatCycle,
  selection: SelectionModele,
): Promise<EtatCycle> {
  return avecTrace(
    "notionSuivante",
    () => creerCycle(normaliserSelection(selection)).terminerEtPasserSuivant(etat),
    {
      objectifId: etat.contexte.objectif.id,
      notionId: etat.contexte.notionCouranteId ?? undefined,
      maitrisees: etat.contexte.profil.notionsMaitrisees.length,
      modele: libelleModele(normaliserSelection(selection)),
    },
  );
}
