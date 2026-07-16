import { notFound, redirect } from "next/navigation";
import { reprendreSession } from "@/app/actions";
import { contenuArchive } from "@/app/_serveur/archive";
import {
  estEtapeCourante,
  slugVersEtapeCycle,
} from "@/app/_experience/navigation";
import { ContenuEtapeCycle } from "@/app/_composants/session/ContenuEtapeCycle";

export default async function PageEtapeNotion({
  params,
}: Readonly<{
  params: Promise<{ objectifId: string; notionId: string; etape: string }>;
}>) {
  const { objectifId, notionId, etape: slugEtape } = await params;
  const etape = slugVersEtapeCycle(slugEtape);

  if (!etape) {
    notFound();
  }

  const session = await reprendreSession(objectifId);

  if (!session) {
    notFound();
  }

  if (session.statut !== "cycle" && session.statut !== "termine") {
    redirect(`/session/${objectifId}`);
  }

  const estCourante = estEtapeCourante(session, notionId, etape);
  const etatCycle = session.etatCycle;

  const contenu =
    estCourante && etatCycle
      ? etatCycle.contenu
      : contenuArchive(session.archive, notionId, etape);

  if (!contenu) {
    notFound();
  }

  const notionArchivee = session.archive?.notions.find(
    (n) => n.notionId === notionId,
  );
  const echangesPrecedents =
    etape === "exercices" && !estCourante
      ? (notionArchivee?.echangesExercice ?? [])
      : estCourante && etape === "exercices"
        ? (notionArchivee?.echangesExercice ?? []).slice(0, -1)
        : [];

  return (
    <ContenuEtapeCycle
      objectifId={objectifId}
      etape={etape}
      contenu={contenu}
      estCourante={estCourante}
      etatCycleCourant={estCourante ? etatCycle : null}
      echangesPrecedents={echangesPrecedents}
    />
  );
}
