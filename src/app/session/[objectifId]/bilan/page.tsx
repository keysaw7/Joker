import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { reprendreSession } from "@/app/actions";
import { Carte } from "@/app/_composants/Carte";
import { Bouton } from "@/app/_composants/Bouton";

export default async function PageBilan({
  params,
}: Readonly<{
  params: Promise<{ objectifId: string }>;
}>) {
  const { objectifId } = await params;
  const session = await reprendreSession(objectifId);

  if (!session) {
    notFound();
  }

  if (session.statut !== "termine") {
    redirect(`/session/${objectifId}`);
  }

  const contexte = session.etatCycle?.contexte;
  const total = contexte?.roadmap?.notions.length ?? 0;
  const maitrisees = contexte?.profil.notionsMaitrisees.length ?? 0;

  return (
    <div className="flex flex-col gap-8 contenu-lecture mx-auto">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium text-accent">Parcours terminé</p>
        <h1 className="text-3xl font-semibold">{session.objectif.intitule}</h1>
        <p className="text-texte-secondaire">
          Félicitations ! Tu as maîtrisé {maitrisees}/{total} notions.
        </p>
      </header>

      <Carte className="text-center">
        <p className="text-2xl font-semibold text-succes">
          Parcours complété avec succès
        </p>
        <p className="mt-3 text-texte-secondaire">
          Tu peux revisiter chaque notion depuis la barre latérale ou commencer un
          nouvel objectif.
        </p>
      </Carte>

      <div className="flex gap-3">
        <Link href={`/domaine/${session.objectif.domaineId}`}>
          <Bouton variante="secondaire">Nouvel objectif</Bouton>
        </Link>
        <Link href="/">
          <Bouton>Retour à l&apos;accueil</Bouton>
        </Link>
      </div>
    </div>
  );
}
