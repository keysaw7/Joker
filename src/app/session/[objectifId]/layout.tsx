import { notFound } from "next/navigation";
import { reprendreSession } from "@/app/actions";
import { EnTeteApp } from "@/app/_composants/EnTeteApp";
import { SidebarParcours } from "@/app/_composants/SidebarParcours";

export default async function LayoutSession({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ objectifId: string }>;
}>) {
  const { objectifId } = await params;
  const session = await reprendreSession(objectifId);

  if (!session) {
    notFound();
  }

  const contexte =
    session.etatCycle?.contexte ?? session.etatParcours?.contexte ?? null;
  const roadmap = contexte?.roadmap ?? null;
  const notionsMaitrisees = contexte?.profil.notionsMaitrisees ?? [];

  return (
    <div className="app-shell">
      <div className="border-b border-bordure px-6 py-4">
        <div className="w-full">
          <EnTeteApp />
        </div>
      </div>
      <div className="app-shell-contenu app-shell-session">
        <SidebarParcours
          objectifId={objectifId}
          intitule={session.objectif.intitule}
          statut={session.statut}
          roadmap={roadmap}
          notionCouranteId={contexte?.notionCouranteId ?? null}
          etapeCourante={session.etatCycle?.etape ?? null}
          archive={session.archive}
          notionsMaitrisees={notionsMaitrisees}
        />
        <div className="app-shell-session-contenu">{children}</div>
      </div>
    </div>
  );
}
