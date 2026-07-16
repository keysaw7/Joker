import type { Domaine, Lacune, SessionPersistee } from "@/core/domain";
import type {
  ChampsProfilElevePersistes,
  CompetenceDomaine,
  ProfilEleve,
} from "@/core/domain/profilEleve";
import { champsProfilEleveInitiaux } from "@/core/domain/profilEleve";

function profilSession(session: SessionPersistee) {
  return (
    session.etatCycle?.contexte.profil ?? session.etatParcours?.contexte.profil ?? null
  );
}

function roadmapSession(session: SessionPersistee) {
  return (
    session.etatCycle?.contexte.roadmap ?? session.etatParcours?.contexte.roadmap ?? null
  );
}

function fusionnerLacunes(lacunes: readonly Lacune[]): Lacune[] {
  const parSujet = new Map<string, Lacune>();
  for (const lacune of lacunes) {
    if (!parSujet.has(lacune.sujet)) {
      parSujet.set(lacune.sujet, lacune);
    }
  }
  return [...parSujet.values()];
}

function valeursUniques(valeurs: readonly string[]): string[] {
  return [...new Set(valeurs)];
}

export function construireProfilEleve(
  utilisateurId: string,
  email: string | null,
  sessions: readonly SessionPersistee[],
  champsPersistes: ChampsProfilElevePersistes | null,
  domaines: readonly Domaine[],
): ProfilEleve {
  const champs = champsPersistes ?? champsProfilEleveInitiaux();
  const sessionsParDomaine = new Map<string, SessionPersistee[]>();

  for (const session of sessions) {
    const domaineId = session.objectif.domaineId;
    const liste = sessionsParDomaine.get(domaineId) ?? [];
    liste.push(session);
    sessionsParDomaine.set(domaineId, liste);
  }

  const preferencesPedagogiques: string[] = [];
  let miseAJour = "1970-01-01T00:00:00.000Z";

  for (const session of sessions) {
    if (session.miseAJour > miseAJour) {
      miseAJour = session.miseAJour;
    }
    const profil = profilSession(session);
    if (profil) {
      preferencesPedagogiques.push(...profil.preferencesPedagogiques);
    }
  }

  const competencesParDomaine: CompetenceDomaine[] = domaines.map((domaine) => {
    const sessionsDomaine = sessionsParDomaine.get(domaine.id) ?? [];
    const lacunes: Lacune[] = [];
    const notionsMaitrisees = new Set<string>();
    let notionsTotal = 0;

    for (const session of sessionsDomaine) {
      const profil = profilSession(session);
      const roadmap = roadmapSession(session);
      if (profil) {
        for (const notion of profil.notionsMaitrisees) {
          notionsMaitrisees.add(notion);
        }
        lacunes.push(...profil.lacunes);
      }
      if (roadmap) {
        notionsTotal = Math.max(notionsTotal, roadmap.notions.length);
      }
    }

    return {
      domaineId: domaine.id,
      niveau: champs.niveauxParDomaine[domaine.id] ?? null,
      objectifsTotal: sessionsDomaine.length,
      notionsMaitrisees: notionsMaitrisees.size,
      notionsTotal,
      lacunes: fusionnerLacunes(lacunes),
      pointsForts: [],
    };
  });

  return {
    utilisateurId,
    email,
    typeMemoire: champs.typeMemoire,
    pointsForts: [...champs.pointsForts],
    pointsFaibles: [...champs.pointsFaibles],
    preferencesPedagogiques: valeursUniques(preferencesPedagogiques),
    competencesParDomaine,
    miseAJour,
  };
}
