interface BarreProgressionProps {
  pourcentage: number;
  libelle?: string;
}

export function BarreProgression({ pourcentage, libelle }: BarreProgressionProps) {
  return (
    <div className="flex flex-col gap-2">
      {libelle && (
        <div className="flex justify-between text-sm text-texte-secondaire">
          <span>{libelle}</span>
          <span>{pourcentage}%</span>
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-bordure">
        <div
          className="h-full rounded-full bg-accent transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(0, pourcentage))}%` }}
        />
      </div>
    </div>
  );
}
