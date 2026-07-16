import type { ExempleExpert } from "@/core/domain";
import { BlocContenuView } from "../cours/BlocContenuView";
import { Carte } from "../Carte";

interface ExempleExpertViewProps {
  exemple: ExempleExpert;
}

export function ExempleExpertView({ exemple }: ExempleExpertViewProps) {
  return (
    <div className="flex flex-col gap-4 contenu-large">
      <p className="text-lg text-texte-secondaire">
        {exemple.contexte}
      </p>
      {exemple.demonstration.map((bloc, index) => (
        <Carte key={index}>
          <BlocContenuView bloc={bloc} />
        </Carte>
      ))}
    </div>
  );
}
