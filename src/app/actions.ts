"use server";

import type { SelectionModele } from "@/adapters/ai/fournisseurs";
import { normaliserSelection } from "@/adapters/ai/fournisseurs";
import { avecTrace } from "@/adapters/logging/contexteTrace";
import type {
  ContexteApprentissage,
  EtatCycle,
  EtatParcours,
  ResumeSession,
  SessionPersistee,
} from "@/core/domain";
import { trouverDomaine } from "./_data/domaines";
import { creerCycle, creerParcours, memoire } from "./_serveur/moteur";
import {
  enregistrerSnapshotCycle,
  enregistrerSnapshotParcours,
} from "./_serveur/snapshots";

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

      const etat = await creerParcours(normaliserSelection(selection)).demarrer(
        domaine,
        objectif,
      );
      await enregistrerSnapshotParcours(etat);
      return etat;
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

      const nouvelEtat = await creerParcours(normaliserSelection(selection)).repondre(etat, {
        questionId: etat.questionCourante.id,
        reponse: texte.trim(),
      });
      await enregistrerSnapshotParcours(nouvelEtat);
      return nouvelEtat;
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
    async () => {
      const etat = await creerCycle(normaliserSelection(selection)).demarrer(contexte);
      await enregistrerSnapshotCycle(etat);
      return etat;
    },
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
    async () => {
      const nouvelEtat = await creerCycle(normaliserSelection(selection)).avancer(etat);
      await enregistrerSnapshotCycle(nouvelEtat);
      return nouvelEtat;
    },
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

      const nouvelEtat = await creerCycle(normaliserSelection(selection)).repondreExercice(
        etat,
        {
          exerciceId: etat.etatExercices.exerciceCourant.id,
          contenu: texte.trim(),
        },
      );
      await enregistrerSnapshotCycle(nouvelEtat);
      return nouvelEtat;
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
    async () => {
      const nouvelEtat = await creerCycle(
        normaliserSelection(selection),
      ).terminerEtPasserSuivant(etat);
      await enregistrerSnapshotCycle(nouvelEtat);
      return nouvelEtat;
    },
    {
      objectifId: etat.contexte.objectif.id,
      notionId: etat.contexte.notionCouranteId ?? undefined,
      maitrisees: etat.contexte.profil.notionsMaitrisees.length,
      modele: libelleModele(normaliserSelection(selection)),
    },
  );
}

export async function listerSessions(domaineId: string): Promise<readonly ResumeSession[]> {
  return memoire().listerSessions(domaineId);
}

export async function reprendreSession(
  objectifId: string,
): Promise<SessionPersistee | null> {
  return memoire().chargerSession(objectifId);
}
