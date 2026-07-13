import type {
  AnalyseReponse,
  ContexteApprentissage,
  EtatExercices,
  Lacune,
  NiveauGuidage,
  Notion,
  ProfilApprenant,
  Roadmap,
} from "@/core/domain";

const ORDRE_GUIDAGE: readonly NiveauGuidage[] = ["fort", "modere", "autonome"];

/** Guidage du premier exercice d'une notion (étayage maximal). */
export const GUIDAGE_INITIAL: NiveauGuidage = "fort";

/** Vérifie que tous les prérequis d'une notion sont maîtrisés. */
export function prerequisSatisfaits(
  notion: Notion,
  notionsMaitrisees: readonly string[],
): boolean {
  const maitrisees = new Set(notionsMaitrisees);
  return notion.prerequisIds.every((id) => maitrisees.has(id));
}

/** Retourne la prochaine notion dont les prérequis sont satisfaits, ou null si terminé. */
export function selectionnerNotionCourante(
  roadmap: Roadmap,
  notionsMaitrisees: readonly string[],
): Notion | null {
  const maitrisees = new Set(notionsMaitrisees);
  return (
    roadmap.notions.find(
      (notion) =>
        !maitrisees.has(notion.id) &&
        prerequisSatisfaits(notion, notionsMaitrisees),
    ) ?? null
  );
}

/**
 * Une notion est maîtrisée lorsqu'un exercice en guidage autonome
 * est répondu correctement sans lacune active.
 */
export function notionEstMaitrisee(
  etatExercices: EtatExercices,
  derniereAnalyse: AnalyseReponse,
): boolean {
  return (
    derniereAnalyse.correcte &&
    etatExercices.guidageActuel === "autonome" &&
    etatExercices.lacuneActive === null
  );
}

/** Progression fort → modere → autonome ; redescend à fort en cas d'erreur. */
export function prochainGuidage(
  actuel: NiveauGuidage,
  analyse: AnalyseReponse,
): NiveauGuidage {
  if (!analyse.correcte) {
    return "fort";
  }
  const index = ORDRE_GUIDAGE.indexOf(actuel);
  if (index < 0 || index >= ORDRE_GUIDAGE.length - 1) {
    return actuel;
  }
  return ORDRE_GUIDAGE[index + 1]!;
}

/** Retourne la lacune à cibler si la réponse est incorrecte. */
export function extraireLacune(analyse: AnalyseReponse): string | null {
  if (analyse.correcte) {
    return null;
  }
  return (
    analyse.connaissanceManquante ??
    analyse.confusion ??
    analyse.erreurCognitive ??
    "difficulté non identifiée"
  );
}

/** Helper immutable pour enrichir le contexte d'apprentissage. */
export function mettreAJourContexte(
  contexte: ContexteApprentissage,
  patch: Partial<ContexteApprentissage>,
): ContexteApprentissage {
  return { ...contexte, ...patch };
}

/** Construit le message de récompense pour une notion maîtrisée. */
export function creerRecompense(notion: Notion): {
  notionId: string;
  titre: string;
  message: string;
} {
  return {
    notionId: notion.id,
    titre: notion.titre,
    message: `Bravo ! Tu maîtrises « ${notion.titre} ».`,
  };
}

/** Enrichit le profil à partir de l'analyse d'une réponse (lacunes, erreurs). */
export function enrichirProfil(
  profil: ProfilApprenant,
  analyse: AnalyseReponse,
  notion: Notion,
): ProfilApprenant {
  if (analyse.correcte) {
    return { ...profil, miseAJour: new Date().toISOString() };
  }

  const description =
    analyse.connaissanceManquante ??
    analyse.confusion ??
    analyse.erreurCognitive ??
    "difficulté non identifiée";

  const nouvelleLacune: Lacune = { sujet: notion.titre, description };
  const lacunes = [...profil.lacunes, nouvelleLacune];

  const erreursFrequentes = analyse.erreurCognitive
    ? profil.erreursFrequentes.includes(analyse.erreurCognitive)
      ? profil.erreursFrequentes
      : [...profil.erreursFrequentes, analyse.erreurCognitive]
    : profil.erreursFrequentes;

  return {
    ...profil,
    lacunes,
    erreursFrequentes,
    miseAJour: new Date().toISOString(),
  };
}

/** Marque une notion comme maîtrisée et purge les lacunes associées. */
export function marquerNotionMaitrisee(
  profil: ProfilApprenant,
  notion: Notion,
): ProfilApprenant {
  const notionsMaitrisees = profil.notionsMaitrisees.includes(notion.id)
    ? profil.notionsMaitrisees
    : [...profil.notionsMaitrisees, notion.id];

  const lacunes = profil.lacunes.filter((l) => l.sujet !== notion.titre);

  return {
    ...profil,
    notionsMaitrisees,
    lacunes,
    miseAJour: new Date().toISOString(),
  };
}
