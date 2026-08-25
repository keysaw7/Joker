/** True si l'URL cible une instance Supabase locale (Docker). */
export function estUrlSupabaseLocale(url: string | undefined): boolean {
  if (!url) {
    return false;
  }

  try {
    const { hostname } = new URL(url);
    return hostname === "127.0.0.1" || hostname === "localhost";
  } catch {
    return false;
  }
}
