import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const ROUTES_PUBLIQUES = ["/connexion", "/callback"];

export async function middleware(request: NextRequest) {
  let reponse = NextResponse.next({ request });

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
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
  const authentifie = Boolean(data.user);
  const chemin = request.nextUrl.pathname;
  const estPublic = ROUTES_PUBLIQUES.some(
    (route) => chemin === route || chemin.startsWith(`${route}/`),
  );

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
