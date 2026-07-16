"use client";

import { useRouter } from "next/navigation";
import { EcranAccueil } from "@/app/_composants/EcranAccueil";

export default function PageAccueil() {
  const router = useRouter();

  return (
    <EcranAccueil
      onChoisirDomaine={(id) => {
        router.push(`/domaine/${id}`);
      }}
    />
  );
}
