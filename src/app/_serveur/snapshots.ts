import type { EtatCycle, EtatParcours, SessionPersistee } from "@/core/domain";
import { memoire } from "@/app/_serveur/moteur";

export async function enregistrerSnapshotParcours(etat: EtatParcours): Promise<void> {
  const session: SessionPersistee = {
    objectif: etat.contexte.objectif,
    statut: etat.phase === "pret" ? "generation" : "diagnostic",
    miseAJour: new Date().toISOString(),
    etatParcours: etat,
    etatCycle: null,
  };

  await memoire().sauvegarderSession(session);
}

export async function enregistrerSnapshotCycle(etat: EtatCycle): Promise<void> {
  const session: SessionPersistee = {
    objectif: etat.contexte.objectif,
    statut: etat.termine ? "termine" : "cycle",
    miseAJour: new Date().toISOString(),
    etatParcours: null,
    etatCycle: etat,
  };

  await memoire().sauvegarderSession(session);
}
