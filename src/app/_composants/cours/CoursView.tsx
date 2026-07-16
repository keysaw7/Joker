import type { Cours } from "@/core/domain";
import { Carte } from "../Carte";
import { BlocContenuView } from "./BlocContenuView";

interface CoursViewProps {
  cours: Cours;
}

export function CoursView({ cours }: CoursViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium text-accent">Cours</p>
        <h2 className="text-2xl font-semibold tracking-tight">{cours.titre}</h2>
      </header>

      <div className="flex flex-col gap-5">
        {cours.blocs.map((bloc, index) => (
          <Carte
            key={index}
            className="bloc-cours-animate"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <BlocContenuView bloc={bloc} />
          </Carte>
        ))}
      </div>
    </div>
  );
}
