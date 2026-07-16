import { notFound, redirect } from "next/navigation";
import { demarrerCycle, reprendreSession } from "@/app/actions";
import {
  cheminSessionCourant,
  urlEtape,
} from "@/app/_experience/navigation";
import { EcranConstructionParcours } from "@/app/_composants/EcranConstructionParcours";

export default async function PageGeneration({
  params,
}: Readonly<{
  params: Promise<{ objectifId: string }>;
}>) {
  const { objectifId } = await params;
  const session = await reprendreSession(objectifId);

  if (!session) {
    notFound();
  }

  if (session.statut === "cycle" || session.statut === "termine") {
    redirect(cheminSessionCourant(session));
  }

  if (session.statut !== "generation") {
    redirect(`/session/${objectifId}/diagnostic`);
  }

  if (!session.etatCycle) {
    const resultat = await demarrerCycle(objectifId);
    redirect(urlEtape(objectifId, resultat.notionId, resultat.etape));
  }

  return <EcranConstructionParcours />;
}
