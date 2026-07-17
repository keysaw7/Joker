import { notFound, redirect } from "next/navigation";
import { reprendreSession } from "@/app/actions";
import { ClientDiagnostic } from "@/app/_composants/session/ClientDiagnostic";

export default async function PageDiagnostic({
  params,
}: Readonly<{
  params: Promise<{ objectifId: string }>;
}>) {
  const { objectifId } = await params;
  const session = await reprendreSession(objectifId);

  if (!session) {
    notFound();
  }

  if (session.statut !== "diagnostic" || !session.etatParcours?.questionCourante) {
    redirect(`/session/${objectifId}`);
  }

  return (
    <div className="contenu-large">
      <ClientDiagnostic
        questionCourante={session.etatParcours.questionCourante!}
        questionsPosees={session.etatParcours.questionsPosees}
      />
    </div>
  );
}
