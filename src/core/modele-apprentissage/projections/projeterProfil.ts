import type {
  CompetenceEstimee,
  EtatGrapheCompetences,
  EstimationNiveau,
  Lacune,
  ModeleApprenant,
  ProfilApprenant,
} from "@/core/domain";
import { moyenneCroyance, varianceCroyance } from "@/core/domain";

/** Seuil de maîtrise probable avec incertitude basse. */
export const SEUIL_MAITRISE_MOYENNE = 0.75;
export const SEUIL_INCERTITUDE_MAX = 0.08;

export function noeudEstProbablementMaitrise(
  modele: ModeleApprenant,
  noeudId: string,
): boolean {
  const croyance = modele.croyances[noeudId];
  if (!croyance || croyance.nObservations === 0) {
    return false;
  }
  return (
    moyenneCroyance(croyance) >= SEUIL_MAITRISE_MOYENNE &&
    varianceCroyance(croyance) <= SEUIL_INCERTITUDE_MAX
  );
}

/**
 * Projection de compatibilité : ProfilApprenant dérivé du Learning Model.
 * Ne mute jamais le modèle — lecture seule.
 */
export function projeterProfilApprenant(
  modele: ModeleApprenant,
  graphe: EtatGrapheCompetences | null,
  objectifId: string,
  profilBase?: ProfilApprenant,
): ProfilApprenant {
  const competences: string[] = [];
  const acquis: string[] = [];

  for (const [noeudId, croyance] of Object.entries(modele.croyances)) {
    if (croyance.nObservations === 0) continue;
    const mean = moyenneCroyance(croyance);
    const noeud = graphe?.noeuds.find((n) => n.id === noeudId);
    const libelle = noeud?.libelle ?? noeudId;

    if (mean >= SEUIL_MAITRISE_MOYENNE) {
      competences.push(libelle);
      acquis.push(libelle);
    }
  }

  // Progression pédagogique : notionsMaitrisees reste contrôlée par le Cycle.
  // Les croyances alimentent acquis / compétences / niveau, pas le déblocage.
  const notionsMaitrisees = [...(profilBase?.notionsMaitrisees ?? [])];

  const descriptionsExistantes = new Set(
    (profilBase?.lacunes ?? []).map((l) => l.description.toLowerCase()),
  );
  const lacunesModele: Lacune[] = Object.values(modele.erreurs)
    .sort((a, b) => b.occurrences - a.occurrences)
    .slice(0, 12)
    .filter((e) => !descriptionsExistantes.has(e.libelle.toLowerCase()))
    .map((e) => ({
      sujet: e.libelle,
      description: `Observée ${e.occurrences} fois (tendance ${e.tendance.toFixed(2)})`,
    }));

  const erreursFrequentes = Object.values(modele.erreurs)
    .sort((a, b) => b.occurrences - a.occurrences)
    .slice(0, 12)
    .map((e) => e.libelle);

  const formatsEfficaces = Object.entries(modele.preferences.efficaciteParFormat)
    .filter(([, c]) => moyenneCroyance(c) >= 0.6)
    .map(([format]) => `format:${format}`);

  return {
    objectifId,
    acquis: uniques([...(profilBase?.acquis ?? []), ...acquis]),
    competences: uniques([...(profilBase?.competences ?? []), ...competences]),
    lacunes: fusionnerLacunes([...(profilBase?.lacunes ?? []), ...lacunesModele]),
    erreursFrequentes: uniques([
      ...(profilBase?.erreursFrequentes ?? []),
      ...erreursFrequentes,
    ]),
    preferencesPedagogiques: uniques([
      ...(profilBase?.preferencesPedagogiques ?? []),
      ...formatsEfficaces,
    ]),
    notionsMaitrisees,
    niveauEstime:
      Object.keys(modele.croyances).length > 0
        ? maitriseAttendueGlobale(modele)
        : (profilBase?.niveauEstime ?? null),
    miseAJour: modele.miseAJour,
  };
}

/**
 * Snapshot de croyances pour l'UI diagnostic (remplace progressivement EstimationNiveau score-centrée).
 */
export function projeterEstimationDepuisModele(
  modele: ModeleApprenant,
  graphe: EtatGrapheCompetences | null,
  estimationBase?: EstimationNiveau | null,
): EstimationNiveau {
  const competences: CompetenceEstimee[] = Object.values(modele.croyances)
    .filter((c) => c.nObservations > 0)
    .map((c) => {
      const noeud = graphe?.noeuds.find((n) => n.id === c.noeudId);
      return {
        competenceId: c.noeudId,
        libelle: noeud?.libelle ?? c.noeudId,
        score: Math.round(moyenneCroyance(c) * 100),
      };
    })
    .sort((a, b) => b.score - a.score);

  const scoreGlobal =
    competences.length === 0
      ? 0
      : Math.round(
          competences.reduce((acc, c) => acc + c.score, 0) / competences.length,
        );

  const n = modele.historiqueObservationIds.length;
  const incertitudes = Object.values(modele.croyances).map(varianceCroyance);
  const incertitudeMoyenne =
    incertitudes.length === 0
      ? 0.25
      : incertitudes.reduce((a, b) => a + b, 0) / incertitudes.length;
  // Confiance = plus d'obs + moins d'incertitude
  const confiance = Math.min(
    1,
    Math.round((0.35 * Math.min(1, n / 6) + 0.65 * (1 - incertitudeMoyenne / 0.25)) * 100) /
      100,
  );

  return {
    scoreGlobal,
    competences,
    confiance: Number.isFinite(confiance) ? confiance : 0,
    evaluations: estimationBase?.evaluations ?? [],
  };
}

export function maitriseAttendueGlobale(modele: ModeleApprenant): number {
  const croyances = Object.values(modele.croyances).filter(
    (c) => c.nObservations > 0,
  );
  if (croyances.length === 0) {
    return 0;
  }
  const mean =
    croyances.reduce((acc, c) => acc + moyenneCroyance(c), 0) / croyances.length;
  return Math.round(mean * 100);
}

function uniques(valeurs: readonly string[]): string[] {
  return [...new Set(valeurs.filter(Boolean))];
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
