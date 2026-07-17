import type {
  ArchiveCycle,
  ContenuEtape,
  EtapeArchivee,
  EtapeCycle,
  EtatCycle,
  Exercice,
  NotionArchivee,
  ReponseApprenant,
} from "@/core/domain";
import { resumeTexteExercice, resumeTexteReponse } from "@/core/domain";

function titreNotion(etat: EtatCycle): string {
  const notionId = etat.contexte.notionCouranteId;
  if (!notionId) {
    return "Notion";
  }
  const notion = etat.contexte.roadmap?.notions.find((n) => n.id === notionId);
  return notion?.titre ?? "Notion";
}

function etapeArchivee(etape: EtapeCycle, contenu: ContenuEtape): EtapeArchivee {
  return { etape, contenu };
}

function fusionnerEtapes(
  existantes: readonly EtapeArchivee[],
  nouvelle: EtapeArchivee,
): readonly EtapeArchivee[] {
  const index = existantes.findIndex((e) => e.etape === nouvelle.etape);
  if (index < 0) {
    return [...existantes, nouvelle];
  }
  const copie = [...existantes];
  copie[index] = nouvelle;
  return copie;
}

export interface DonneesReponseExerciceArchive {
  readonly exercice: Exercice;
  readonly reponse: ReponseApprenant;
}

/** Fusionne l'état courant du cycle dans l'archive revisitable. */
export function fusionnerArchive(
  archivePrecedente: ArchiveCycle | null,
  etat: EtatCycle,
  reponseExercice?: DonneesReponseExerciceArchive | { enonce: string; reponse: string },
): ArchiveCycle {
  const notionId = etat.contexte.notionCouranteId;
  if (!notionId) {
    return archivePrecedente ?? { notions: [] };
  }

  const notions = [...(archivePrecedente?.notions ?? [])];
  const index = notions.findIndex((n) => n.notionId === notionId);
  const maitrisee = etat.contexte.profil.notionsMaitrisees.includes(notionId);

  const notionExistante: NotionArchivee | undefined = notions[index];
  let echanges = [...(notionExistante?.echangesExercice ?? [])];

  if (reponseExercice) {
    const correction =
      etat.contenu.type === "exercice"
        ? etat.contenu.correctionPrecedente
        : etat.contenu.type === "recompense"
          ? etat.contenu.correctionPrecedente
          : undefined;

    if ("exercice" in reponseExercice) {
      echanges = [
        ...echanges,
        {
          enonce: resumeTexteExercice(reponseExercice.exercice),
          reponse: resumeTexteReponse(reponseExercice.reponse),
          correction,
          exercice: reponseExercice.exercice,
          reponseStructuree: reponseExercice.reponse,
        },
      ];
    } else {
      echanges = [
        ...echanges,
        {
          enonce: reponseExercice.enonce,
          reponse: reponseExercice.reponse,
          correction,
        },
      ];
    }
  }

  const nouvelleNotion: NotionArchivee = {
    notionId,
    titre: titreNotion(etat),
    etapes: fusionnerEtapes(
      notionExistante?.etapes ?? [],
      etapeArchivee(etat.etape, etat.contenu),
    ),
    echangesExercice: echanges,
    maitrisee: maitrisee || (notionExistante?.maitrisee ?? false),
  };

  if (index < 0) {
    notions.push(nouvelleNotion);
  } else {
    notions[index] = nouvelleNotion;
  }

  return { notions };
}

/** Récupère le contenu archivé pour une notion/étape donnée. */
export function contenuArchive(
  archive: ArchiveCycle | null,
  notionId: string,
  etape: EtapeCycle,
): ContenuEtape | null {
  const notion = archive?.notions.find((n) => n.notionId === notionId);
  const archivee = notion?.etapes.find((e) => e.etape === etape);
  return archivee?.contenu ?? null;
}
