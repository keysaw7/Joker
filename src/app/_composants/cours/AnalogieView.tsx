interface AnalogieViewProps {
  source: string;
  cible: string;
  explication: string;
}

export function AnalogieView({ source, cible, explication }: AnalogieViewProps) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-medium uppercase tracking-wide text-accent">
        Analogie
      </span>
      <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
        <span className="rounded-lg bg-fond px-3 py-1.5">{source}</span>
        <span className="text-texte-secondaire">→</span>
        <span className="rounded-lg bg-accent px-3 py-1.5 text-white">
          {cible}
        </span>
      </div>
      <p className="leading-relaxed text-texte-secondaire">{explication}</p>
    </div>
  );
}
