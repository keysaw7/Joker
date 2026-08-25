import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { estUrlSupabaseLocale } from "@/adapters/auth/estUrlSupabaseLocale";

const ROUTES_PUBLIQUES = ["/connexion", "/callback"];

export async function proxy(request: NextRequest) {
  let reponse = NextResponse.next({ request });

  const urlSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const client = createServerClient(
    urlSupabase,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          reponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            reponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const { data } = await client.auth.getUser();
  let authentifie = Boolean(data.user);
  const chemin = request.nextUrl.pathname;
  const estPublic = ROUTES_PUBLIQUES.some(
    (route) => chemin === route || chemin.startsWith(`${route}/`),
  );

  if (!authentifie && estUrlSupabaseLocale(urlSupabase)) {
    const { data: anonyme, error } = await client.auth.signInAnonymously();
    if (!error && anonyme.user) {
      authentifie = true;
    }
  }

  if (!authentifie && !estPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    url.searchParams.set("redirect", chemin);
    return NextResponse.redirect(url);
  }

  if (authentifie && chemin === "/connexion") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return reponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
