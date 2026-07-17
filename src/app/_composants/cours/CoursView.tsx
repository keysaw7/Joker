import type { BlocContenu, Cours } from "@/core/domain";
import { Carte } from "../Carte";
import { BlocContenuView } from "./BlocContenuView";

interface CoursViewProps {
  cours: Cours;
}

const TYPES_BLOC_EN_CARTE = new Set<BlocContenu["type"]>([
  "schema",
  "graphique",
  "image",
  "quizFlash",
  "comparaison",
  "tableau",
]);

function blocEnCarte(type: BlocContenu["type"]): boolean {
  return TYPES_BLOC_EN_CARTE.has(type);
}

export function CoursView({ cours }: CoursViewProps) {
  return (
    <article className="cours-document flex flex-col gap-8">
      <header className="flex flex-col gap-2 border-b border-bordure pb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-texte">{cours.titre}</h2>
      </header>

      <div className="cours-corps flex flex-col gap-6">
        {cours.blocs.map((bloc, index) => {
          const contenu = <BlocContenuView bloc={bloc} />;

          if (blocEnCarte(bloc.type)) {
            return (
              <Carte
                key={index}
                className="bloc-cours-animate cours-bloc-media"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {contenu}
              </Carte>
            );
          }

          return (
            <div
              key={index}
              className="bloc-cours-animate cours-bloc-prose"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {contenu}
            </div>
          );
        })}
      </div>
    </article>
  );
}
