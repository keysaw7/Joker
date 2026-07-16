import { NextResponse } from "next/server";
import { creerClientSupabaseServeur } from "@/adapters/auth/supabase/serveur";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectVers = searchParams.get("redirect") ?? "/";

  if (code) {
    const client = await creerClientSupabaseServeur();
    const { error } = await client.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${redirectVers}`);
    }
  }

  return NextResponse.redirect(`${origin}/connexion`);
}
