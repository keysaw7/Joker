"use server";

import { SELECTION_DEFAUT } from "@/adapters/ai/fournisseurs";
import { exigerUtilisateurCourant } from "@/adapters/auth/utilisateurCourant";
import { avecTrace } from "@/adapters/logging/contexteTrace";
import type {
  EtapeCycle,
  ProfilEleve,
  ResumeSession,
  SessionPersistee,
} from "@/core/domain";
import { construireProfilEleve } from "@/core/profil-eleve/agregation";
import { trouverDomaine, DOMAINES } from "./_data/domaines";
import { creerCycle, creerParcours, persistanceCourante } from "./_serveur/moteur";
import { transcrireAudioServeur } from "./_serveur/transcription";
import {
  enregistrerSnapshotCycle,
  enregistrerSnapshotParcours,
} from "./_serveur/snapshots";

export interface ResultatEtape {
  readonly notionId: string;
  readonly etape: EtapeCycle;
  readonly termine: boolean;
}

async function chargerSession(objectifId: string): Promise<SessionPersistee> {
  const persistance = await persistanceCourante();
  const session = await persistance.chargerSession(objectifId);
  if (!session) {
    throw new Error(`Session « ${objectifId} » introuvable`);
  }
  return session;
}

function resultatDepuisCycle(etat: import("@/core/domain").EtatCycle): ResultatEtape {
  const notionId = etat.contexte.notionCouranteId;
  if (!notionId) {
    throw new Error("Aucune notion courante");
  }
  return {
    notionId,
    etape: etat.etape,
    termine: etat.termine,
  };
}

export async function demarrerParcours(
  domaineId: string,
  intitule: string,
): Promise<string> {
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

      const orchestrateur = await creerParcours(SELECTION_DEFAUT);
      const etat = await orchestrateur.demarrer(domaine, objectif);
      await enregistrerSnapshotParcours(etat);
      return objectif.id;
    },
    {
      domaine: domaineId,
      intitule: intitule.trim(),
    },
  );
}

export interface ResultatReponseDiagnosticClient {
  readonly termine: boolean;
  readonly question?: import("@/core/domain").QuestionDiagnostic;
  readonly questionsPosees: number;
}

export async function transcrireAudio(
  formData: FormData,
): Promise<{ texte: string }> {
  return avecTrace(
    "transcrireAudio",
    async () => {
      await exigerUtilisateurCourant();
      const fichier = formData.get("audio");
      if (!(fichier instanceof Blob) || fichier.size === 0) {
        throw new Error("Audio manquant ou vide");
      }
      const mediaType =
        (formData.get("mediaType") as string | null)?.trim() || fichier.type;
      const langue =
        (formData.get("langue") as string | null)?.trim() || undefined;
      const buffer = new Uint8Array(await fichier.arrayBuffer());
      const texte = await transcrireAudioServeur(buffer, mediaType, langue);
      return { texte };
    },
    {},
  );
}

export async function repondreDiagnostic(
  objectifId: string,
  reponse: string,
): Promise<ResultatReponseDiagnosticClient> {
  return avecTrace(
    "repondreDiagnostic",
    async () => {
      const session = await chargerSession(objectifId);
      if (!session.etatParcours) {
        throw new Error("Parcours non disponible pour le diagnostic");
      }

      const orchestrateur = await creerParcours(SELECTION_DEFAUT);
      const resultat = await orchestrateur.repondre(
        session.etatParcours,
        reponse,
      );
      await enregistrerSnapshotParcours(resultat.etat);

      return {
        termine: resultat.termine,
        question: resultat.termine
          ? undefined
          : (resultat.etat.questionCourante ?? undefined),
        questionsPosees: resultat.etat.questionsPosees,
      };
    },
    { objectifId },
  );
}

export async function demarrerCycle(objectifId: string): Promise<ResultatEtape> {
  return avecTrace(
    "demarrerCycle",
    async () => {
      const session = await chargerSession(objectifId);
      const contexte =
        session.etatParcours?.contexte ?? session.etatCycle?.contexte;
      if (!contexte?.roadmap) {
        throw new Error("Roadmap indisponible pour démarrer le cycle");
      }

      const orchestrateur = await creerCycle(SELECTION_DEFAUT);
      const etat = await orchestrateur.demarrer(contexte);
      await enregistrerSnapshotCycle(etat);
      return resultatDepuisCycle(etat);
    },
    { objectifId },
  );
}

export async function avancerCycle(objectifId: string): Promise<ResultatEtape> {
  return avecTrace(
    "avancerCycle",
    async () => {
      const session = await chargerSession(objectifId);
      if (!session.etatCycle) {
        throw new Error("Cycle non disponible");
      }

      const orchestrateur = await creerCycle(SELECTION_DEFAUT);
      const nouvelEtat = await orchestrateur.avancer(session.etatCycle);
      await enregistrerSnapshotCycle(nouvelEtat);
      return resultatDepuisCycle(nouvelEtat);
    },
    { objectifId },
  );
}

export async function repondreExercice(
  objectifId: string,
  texte: string,
): Promise<ResultatEtape> {
  return avecTrace(
    "repondreExercice",
    async () => {
      const session = await chargerSession(objectifId);
      if (!session.etatCycle?.etatExercices) {
        throw new Error("Aucun exercice en cours");
      }

      const etat = session.etatCycle;
      const enonce = etat.etatExercices!.exerciceCourant.enonce;
      const reponse = texte.trim();

      const orchestrateur = await creerCycle(SELECTION_DEFAUT);
      const nouvelEtat = await orchestrateur.repondreExercice(etat, {
        exerciceId: etat.etatExercices!.exerciceCourant.id,
        contenu: reponse,
      });
      await enregistrerSnapshotCycle(nouvelEtat, { enonce, reponse });
      return resultatDepuisCycle(nouvelEtat);
    },
    { objectifId },
  );
}

export async function notionSuivante(objectifId: string): Promise<ResultatEtape> {
  return avecTrace(
    "notionSuivante",
    async () => {
      const session = await chargerSession(objectifId);
      if (!session.etatCycle) {
        throw new Error("Cycle non disponible");
      }

      const orchestrateur = await creerCycle(SELECTION_DEFAUT);
      const nouvelEtat = await orchestrateur.terminerEtPasserSuivant(session.etatCycle);
      await enregistrerSnapshotCycle(nouvelEtat);
      return resultatDepuisCycle(nouvelEtat);
    },
    { objectifId },
  );
}

export async function listerSessions(domaineId: string): Promise<readonly ResumeSession[]> {
  const persistance = await persistanceCourante();
  return persistance.listerSessions(domaineId);
}

export async function reprendreSession(
  objectifId: string,
): Promise<SessionPersistee | null> {
  const persistance = await persistanceCourante();
  return persistance.chargerSession(objectifId);
}

export async function supprimerSession(objectifId: string): Promise<void> {
  return avecTrace("supprimerSession", async () => {
    const persistance = await persistanceCourante();
    await persistance.supprimerSession(objectifId);
  }, { objectifId });
}

export async function obtenirProfilEleve(): Promise<ProfilEleve> {
  return avecTrace("obtenirProfilEleve", async () => {
    const utilisateur = await exigerUtilisateurCourant();
    const persistance = await persistanceCourante();
    const [sessions, champsPersistes] = await Promise.all([
      persistance.chargerToutesSessions(),
      persistance.chargerProfilEleve(),
    ]);

    return construireProfilEleve(
      utilisateur.id,
      utilisateur.email,
      sessions,
      champsPersistes,
      DOMAINES,
    );
  });
}
