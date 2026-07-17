"use client";

import { useEffect, useId, useRef, useState } from "react";

interface MermaidViewProps {
  mermaid: string;
  legende?: string;
}

let mermaidInitialise = false;

async function obtenirMermaid() {
  const lib = (await import("mermaid")).default;
  if (!mermaidInitialise) {
    lib.initialize({
      startOnLoad: false,
      theme: "neutral",
      securityLevel: "strict",
      fontFamily: "inherit",
    });
    mermaidInitialise = true;
  }
  return lib;
}

export function MermaidView({ mermaid, legende }: MermaidViewProps) {
  const conteneurRef = useRef<HTMLDivElement>(null);
  const idUnique = useId().replace(/:/g, "");
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);
  const [detailsOuverts, setDetailsOuverts] = useState(false);

  useEffect(() => {
    let annule = false;

    async function rendre() {
      if (!conteneurRef.current) return;
      setChargement(true);
      setErreur(null);
      try {
        const libMermaid = await obtenirMermaid();
        const { svg } = await libMermaid.render(`mermaid-${idUnique}`, mermaid.trim());
        if (!annule && conteneurRef.current) {
          conteneurRef.current.innerHTML = svg;
          setErreur(null);
        }
      } catch (e) {
        if (!annule) {
          setErreur(e instanceof Error ? e.message : "Erreur de rendu Mermaid");
        }
      } finally {
        if (!annule) {
          setChargement(false);
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
      <div className="flex flex-col gap-3 rounded-lg border border-bordure bg-fond p-4">
        <p className="text-sm text-texte-secondaire">
          Le schéma n&apos;a pas pu être affiché. Le contenu reste disponible ci-dessous.
        </p>
        {legende ? <p className="text-sm italic text-texte-secondaire">{legende}</p> : null}
        <button
          type="button"
          className="self-start text-xs font-medium text-accent underline-offset-2 hover:underline"
          onClick={() => setDetailsOuverts((v) => !v)}
        >
          {detailsOuverts ? "Masquer le détail technique" : "Voir le détail technique"}
        </button>
        {detailsOuverts ? (
          <pre className="overflow-x-auto rounded-lg bg-surface p-3 text-xs text-texte-secondaire">
            {mermaid}
          </pre>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {chargement ? (
        <p className="text-center text-sm text-texte-secondaire">Chargement du schéma…</p>
      ) : null}
      <div
        ref={conteneurRef}
        className="mermaid-cours flex justify-center overflow-x-auto [&_svg]:max-w-full"
      />
      {legende ? <p className="text-center text-sm italic text-texte-secondaire">{legende}</p> : null}
    </div>
  );
}
