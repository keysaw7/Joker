import type { NextConfig } from "next";
import { estUrlSupabaseLocale } from "./src/adapters/auth/estUrlSupabaseLocale";

function motifsImagesSupabase(): NonNullable<
  NextConfig["images"]
>["remotePatterns"] {
  const brut = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!brut) {
    return [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ];
  }

  const url = new URL(brut);
  const protocol = url.protocol === "http:" ? "http" : "https";
  return [
    {
      protocol,
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
      pathname: "/storage/v1/object/public/**",
    },
  ];
}

const urlSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    // Fallback STT (MediaRecorder → serveur) : un clip court peut dépasser 1 Mo.
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  images: {
    dangerouslyAllowLocalIP: estUrlSupabaseLocale(urlSupabase),
    remotePatterns: motifsImagesSupabase(),
  },
};

export default nextConfig;
