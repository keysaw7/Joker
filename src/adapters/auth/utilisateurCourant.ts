import { redirect } from "next/navigation";
import { creerClientSupabaseServeur } from "@/adapters/auth/supabase/serveur";

export interface UtilisateurCourant {
  readonly id: string;
  readonly email: string | null;
}

export async function obtenirUtilisateurCourant(): Promise<UtilisateurCourant | null> {
  const client = await creerClientSupabaseServeur();
  const { data } = await client.auth.getUser();
  const utilisateur = data.user;

  if (!utilisateur) {
    return null;
  }

  return {
    id: utilisateur.id,
    email: utilisateur.email ?? null,
  };
}

export async function exigerUtilisateurCourant(): Promise<UtilisateurCourant> {
  const utilisateur = await obtenirUtilisateurCourant();
  if (!utilisateur) {
    redirect("/connexion");
  }
  return utilisateur;
}
