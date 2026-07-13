import type { BlocContenu } from "@/core/domain";

interface BlocContenuViewProps {
  bloc: BlocContenu;
}

export function BlocContenuView({ bloc }: BlocContenuViewProps) {
  const formatLabel: Record<string, string> = {
    texte: "",
    image: "Image",
    schema: "Schéma",
    diagramme: "Diagramme",
    graphique: "Graphique",
    tableau: "Tableau",
    video: "Vidéo",
    animation: "Animation",
    simulation: "Simulation",
    comparaison: "Comparaison",
    analogie: "Analogie",
  };

  const label = formatLabel[bloc.format];

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-texte-secondaire)]">
          {label}
        </span>
      )}
      <p className="whitespace-pre-wrap leading-relaxed text-[var(--color-texte)]">
        {bloc.contenu}
      </p>
      {bloc.legende && (
        <p className="text-sm italic text-[var(--color-texte-secondaire)]">
          {bloc.legende}
        </p>
      )}
    </div>
  );
}
