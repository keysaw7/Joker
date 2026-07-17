import type { Domaine, Lacune, ModeleApprenant, SessionPersistee } from "@/core/domain";
import type {
  ChampsProfilElevePersistes,
  CompetenceDomaine,
  ProfilEleve,
} from "@/core/domain/profilEleve";
import { champsProfilEleveInitiaux } from "@/core/domain/profilEleve";
import {
  faiblessesProbablesDepuisModele,
  forcesProbablesDepuisModele,
  formatsEfficacesDepuisModele,
} from "@/core/modele-apprentissage";

function profilSession(session: SessionPersistee) {
  return (
    session.etatCycle?.contexte.profil ?? session.etatParcours?.contexte.profil ?? null
  );
}

function modeleSession(session: SessionPersistee): ModeleApprenant | null {
  return (
    session.etatCycle?.contexte.modeleApprenant ??
    session.etatParcours?.contexte.modeleApprenant ??
    null
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
  const forcesProbables: string[] = [];
  const faiblessesProbables: string[] = [];
  let miseAJour = "1970-01-01T00:00:00.000Z";

  for (const session of sessions) {
    if (session.miseAJour > miseAJour) {
      miseAJour = session.miseAJour;
    }
    const profil = profilSession(session);
    if (profil) {
      preferencesPedagogiques.push(...profil.preferencesPedagogiques);
    }
    const modele = modeleSession(session);
    if (modele) {
      forcesProbables.push(...forcesProbablesDepuisModele(modele));
      faiblessesProbables.push(...faiblessesProbablesDepuisModele(modele));
      preferencesPedagogiques.push(...formatsEfficacesDepuisModele(modele));
    }
  }

  const competencesParDomaine: CompetenceDomaine[] = domaines.map((domaine) => {
    const sessionsDomaine = sessionsParDomaine.get(domaine.id) ?? [];
    const lacunes: Lacune[] = [];
    const notionsMaitrisees = new Set<string>();
    const pointsFortsDomaine: string[] = [];
    let notionsTotal = 0;

    for (const session of sessionsDomaine) {
      const profil = profilSession(session);
      const roadmap = roadmapSession(session);
      const modele = modeleSession(session);
      if (profil) {
        for (const notion of profil.notionsMaitrisees) {
          notionsMaitrisees.add(notion);
        }
        lacunes.push(...profil.lacunes);
      }
      if (modele) {
        pointsFortsDomaine.push(...forcesProbablesDepuisModele(modele, 3));
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
      pointsForts: valeursUniques(pointsFortsDomaine),
    };
  });

  return {
    utilisateurId,
    email,
    // typeMemoire reste un champ legacy de projection UI ; non alimenté par le Learning Model.
    typeMemoire: champs.typeMemoire,
    pointsForts: valeursUniques([...champs.pointsForts, ...forcesProbables]),
    pointsFaibles: valeursUniques([...champs.pointsFaibles, ...faiblessesProbables]),
    preferencesPedagogiques: valeursUniques(preferencesPedagogiques),
    competencesParDomaine,
    miseAJour,
  };
}
