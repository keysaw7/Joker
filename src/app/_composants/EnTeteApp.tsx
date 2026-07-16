"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { obtenirSessionUtilisateur, seDeconnecter } from "@/app/auth-actions";
import { Bouton } from "./Bouton";

interface EnTeteAppProps {
  email?: string | null;
}

function lienActif(chemin: string, actuel: string): string {
  const actif =
    chemin === "/"
      ? actuel === "/"
      : actuel === chemin || actuel.startsWith(`${chemin}/`);
  return actif
    ? "text-accent"
    : "text-texte-secondaire hover:text-texte";
}

export function EnTeteApp({ email: emailInitial }: EnTeteAppProps) {
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null | undefined>(emailInitial);
  const [enCours, startTransition] = useTransition();

  useEffect(() => {
    if (emailInitial === undefined) {
      obtenirSessionUtilisateur().then((utilisateur) => {
        setEmail(utilisateur?.email ?? null);
      });
    }
  }, [emailInitial]);

  return (
    <header className="flex flex-col gap-4 border-b border-bordure pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-6">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight transition-colors hover:text-accent"
        >
          Joker
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/" className={lienActif("/", pathname)}>
            Accueil
          </Link>
          <Link href="/profil" className={lienActif("/profil", pathname)}>
            Profil
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-3 text-sm">
        {email ? (
          <>
            <span className="text-texte-secondaire">{email}</span>
            <Bouton
              variante="secondaire"
              enCours={enCours}
              onClick={() => startTransition(() => seDeconnecter())}
            >
              Se déconnecter
            </Bouton>
          </>
        ) : (
          <Link
            href="/connexion"
            className="font-medium text-accent hover:underline"
          >
            Se connecter
          </Link>
        )}
      </div>
    </header>
  );
}
