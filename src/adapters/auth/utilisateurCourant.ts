import { redirect } from "next/navigation";
import { creerClientSupabaseServeur } from "@/adapters/auth/supabase/serveur";
import {
  construireUtilisateurCourant,
  type UtilisateurCourant,
} from "@/adapters/auth/utilisateur";

export type { UtilisateurCourant };

export async function obtenirUtilisateurCourant(): Promise<UtilisateurCourant | null> {
  const client = await creerClientSupabaseServeur();
  const { data } = await client.auth.getUser();
  const utilisateur = data.user;

  if (!utilisateur) {
    return null;
  }

  return construireUtilisateurCourant(utilisateur);
}

export async function exigerUtilisateurCourant(): Promise<UtilisateurCourant> {
  const utilisateur = await obtenirUtilisateurCourant();
  if (!utilisateur) {
    redirect("/connexion");
  }
  return utilisateur;
}
