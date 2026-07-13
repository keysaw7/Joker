import type { ResumeSession, SessionPersistee } from "@/core/domain";

export function calculerResumeSession(session: SessionPersistee): ResumeSession {
  const contexte =
    session.etatCycle?.contexte ?? session.etatParcours?.contexte ?? null;

  return {
    objectif: session.objectif,
    statut: session.statut,
    miseAJour: session.miseAJour,
    notionsTotal: contexte?.roadmap?.notions.length ?? 0,
    notionsMaitrisees: contexte?.profil.notionsMaitrisees.length ?? 0,
  };
}

export function listerResumesSessions(
  sessions: readonly SessionPersistee[],
  domaineId: string,
): ResumeSession[] {
  return sessions
    .filter((session) => session.objectif.domaineId === domaineId)
    .map(calculerResumeSession)
    .sort((a, b) => b.miseAJour.localeCompare(a.miseAJour));
}
