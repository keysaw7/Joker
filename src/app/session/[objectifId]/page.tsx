import { redirect } from "next/navigation";
import { reprendreSession } from "@/app/actions";
import { cheminSessionCourant } from "@/app/_experience/navigation";

export default async function PageHubSession({
  params,
}: Readonly<{
  params: Promise<{ objectifId: string }>;
}>) {
  const { objectifId } = await params;
  const session = await reprendreSession(objectifId);

  if (!session) {
    redirect("/");
  }

  if (session.statut === "generation") {
    redirect(`/session/${objectifId}/generation`);
  }

  redirect(cheminSessionCourant(session));
}
