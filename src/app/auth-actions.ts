"use server";

import { redirect } from "next/navigation";
import { creerClientSupabaseServeur } from "@/adapters/auth/supabase/serveur";
import { obtenirUtilisateurCourant } from "@/adapters/auth/utilisateurCourant";

export async function obtenirSessionUtilisateur() {
  return obtenirUtilisateurCourant();
}

export async function seConnecterEmail(
  email: string,
  motDePasse: string,
): Promise<{ erreur?: string }> {
  const client = await creerClientSupabaseServeur();
  const { error } = await client.auth.signInWithPassword({
    email: email.trim(),
    password: motDePasse,
  });

  if (error) {
    return { erreur: error.message };
  }

  redirect("/");
}

export async function sinscrireEmail(
  email: string,
  motDePasse: string,
): Promise<{ erreur?: string }> {
  const client = await creerClientSupabaseServeur();
  const { error } = await client.auth.signUp({
    email: email.trim(),
    password: motDePasse,
  });

  if (error) {
    return { erreur: error.message };
  }

  redirect("/");
}

export async function seDeconnecter(): Promise<void> {
  const client = await creerClientSupabaseServeur();
  await client.auth.signOut();
  redirect("/connexion");
}
