import { estUrlSupabaseLocale } from "@/adapters/auth/estUrlSupabaseLocale";

export interface UtilisateurCourant {
  readonly id: string;
  readonly email: string | null;
  readonly modeLocal: boolean;
}

export function construireUtilisateurCourant(
  utilisateur: {
    readonly id: string;
    readonly email?: string | null;
    readonly is_anonymous?: boolean;
  },
  urlSupabase: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL,
): UtilisateurCourant {
  return {
    id: utilisateur.id,
    email: utilisateur.email ?? null,
    modeLocal:
      utilisateur.is_anonymous === true && estUrlSupabaseLocale(urlSupabase),
  };
}
