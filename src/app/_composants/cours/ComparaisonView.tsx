import { TableauView } from "./TableauView";

interface ComparaisonViewProps {
  entetes: readonly string[];
  lignes: readonly (readonly string[])[];
}

export function ComparaisonView({ entetes, lignes }: ComparaisonViewProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-accent">
        Comparaison
      </span>
      <TableauView entetes={entetes} lignes={lignes} />
    </div>
  );
}
