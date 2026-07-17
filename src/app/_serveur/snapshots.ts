import type { EtatCycle, EtatParcours, SessionPersistee } from "@/core/domain";
import {
  fusionnerArchive,
  type DonneesReponseExerciceArchive,
} from "@/app/_serveur/archive";
import { persistanceCourante } from "@/app/_serveur/moteur";

export async function enregistrerSnapshotParcours(etat: EtatParcours): Promise<void> {
  const persistance = await persistanceCourante();
  const existante = await persistance.chargerSession(etat.contexte.objectif.id);

  const session: SessionPersistee = {
    objectif: etat.contexte.objectif,
    statut: etat.phase === "pret" ? "generation" : "diagnostic",
    miseAJour: new Date().toISOString(),
    etatParcours: etat,
    etatCycle: null,
    archive: existante?.archive ?? null,
  };

  await persistance.sauvegarderSession(session);
}

export async function enregistrerSnapshotCycle(
  etat: EtatCycle,
  reponseExercice?: DonneesReponseExerciceArchive,
): Promise<void> {
  const persistance = await persistanceCourante();
  const existante = await persistance.chargerSession(etat.contexte.objectif.id);
  const archive = fusionnerArchive(existante?.archive ?? null, etat, reponseExercice);

  const session: SessionPersistee = {
    objectif: etat.contexte.objectif,
    statut: etat.termine ? "termine" : "cycle",
    miseAJour: new Date().toISOString(),
    etatParcours: null,
    etatCycle: etat,
    archive,
  };

  await persistance.sauvegarderSession(session);
}
