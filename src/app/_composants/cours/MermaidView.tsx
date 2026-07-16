"use client";

import { useEffect, useId, useRef, useState } from "react";

interface MermaidViewProps {
  mermaid: string;
}

export function MermaidView({ mermaid }: MermaidViewProps) {
  const conteneurRef = useRef<HTMLDivElement>(null);
  const idUnique = useId().replace(/:/g, "");
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    let annule = false;

    async function rendre() {
      if (!conteneurRef.current) return;
      try {
        const libMermaid = (await import("mermaid")).default;
        libMermaid.initialize({
          startOnLoad: false,
          theme: "neutral",
          securityLevel: "strict",
          fontFamily: "inherit",
        });
        const { svg } = await libMermaid.render(`mermaid-${idUnique}`, mermaid.trim());
        if (!annule && conteneurRef.current) {
          conteneurRef.current.innerHTML = svg;
          setErreur(null);
        }
      } catch (e) {
        if (!annule) {
          setErreur(e instanceof Error ? e.message : "Erreur de rendu Mermaid");
        }
      }
    }

    void rendre();
    return () => {
      annule = true;
    };
  }, [mermaid, idUnique]);

  if (erreur) {
    return (
      <pre className="overflow-x-auto rounded-lg bg-fond p-4 text-xs text-texte-secondaire">
        {mermaid}
      </pre>
    );
  }

  return (
    <div
      ref={conteneurRef}
      className="mermaid-cours flex justify-center overflow-x-auto [&_svg]:max-w-full"
    />
  );
}
