"use client";

import { useState, useTransition } from "react";
import { seConnecterEmail, sinscrireEmail } from "@/app/auth-actions";
import { Bouton } from "@/app/_composants/Bouton";
import { Carte } from "@/app/_composants/Carte";

type ModeConnexion = "connexion" | "inscription";

const styleChamp =
  "w-full rounded-lg border border-bordure bg-surface px-4 py-3 text-texte placeholder:text-texte-secondaire focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

export function FormulaireConnexion() {
  const [mode, setMode] = useState<ModeConnexion>("connexion");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, startTransition] = useTransition();

  function soumettreFormulaire(formData: FormData) {
    const email = String(formData.get("email") ?? "");
    const motDePasse = String(formData.get("motDePasse") ?? "");

    startTransition(async () => {
      setErreur(null);
      const resultat =
        mode === "connexion"
          ? await seConnecterEmail(email, motDePasse)
          : await sinscrireEmail(email, motDePasse);

      if (resultat?.erreur) {
        setErreur(resultat.erreur);
      }
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium text-accent">Compte</p>
        <h1 className="text-2xl font-semibold">
          {mode === "connexion" ? "Se connecter" : "Créer un compte"}
        </h1>
        <p className="text-texte-secondaire">
          Retrouvez votre profil et vos parcours sur tous vos appareils.
        </p>
      </header>

      <Carte className="flex flex-col gap-6">
        <form action={soumettreFormulaire} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-texte-secondaire"
            >
              Adresse e-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className={styleChamp}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="motDePasse"
              className="text-sm font-medium text-texte-secondaire"
            >
              Mot de passe
            </label>
            <input
              id="motDePasse"
              name="motDePasse"
              type="password"
              required
              minLength={6}
              autoComplete={mode === "connexion" ? "current-password" : "new-password"}
              className={styleChamp}
            />
          </div>

          {erreur && (
            <p className="text-sm text-red-600" role="alert">
              {erreur}
            </p>
          )}

          <Bouton type="submit" enCours={enCours}>
            {mode === "connexion" ? "Se connecter" : "S'inscrire"}
          </Bouton>
        </form>

        <button
          type="button"
          onClick={() => {
            setErreur(null);
            setMode(mode === "connexion" ? "inscription" : "connexion");
          }}
          className="text-sm text-accent hover:underline"
        >
          {mode === "connexion"
            ? "Pas encore de compte ? S'inscrire"
            : "Déjà un compte ? Se connecter"}
        </button>
      </Carte>
    </div>
  );
}
