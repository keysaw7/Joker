import type { Problematique } from "@/core/domain";
import { Carte } from "../Carte";

interface ProblematiqueViewProps {
  problematique: Problematique;
}

export function ProblematiqueView({ problematique }: ProblematiqueViewProps) {
  return (
    <div className="flex flex-col gap-6 contenu-large">
      <Carte>
        <p className="text-xl font-medium leading-relaxed">
          {problematique.intitule}
        </p>
      </Carte>

      {problematique.casDusage.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-texte-secondaire">
            Ce que tu pourras faire
          </h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {problematique.casDusage.map((cas, index) => (
              <li key={index}>
                <Carte className="flex h-full flex-col gap-1">
                  <p className="font-medium">{cas.titre}</p>
                  <p className="text-sm leading-relaxed text-texte-secondaire">
                    {cas.description}
                  </p>
                </Carte>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
