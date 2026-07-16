import type { Correction, Recompense } from "@/core/domain";
import { Carte } from "../Carte";

interface RecompenseViewProps {
  recompense: Recompense;
  correctionPrecedente?: Correction;
  termine?: boolean;
}

export function RecompenseView({
  recompense,
  correctionPrecedente,
  termine = false,
}: RecompenseViewProps) {
  return (
    <Carte className="contenu-lecture mx-auto text-center">
      <p className="text-2xl font-semibold text-succes">
        {recompense.message}
      </p>
      {correctionPrecedente && (
        <p className="mt-3 text-sm text-texte-secondaire">
          {correctionPrecedente.explicationPersonnalisee}
        </p>
      )}
      {termine && (
        <p className="mt-4 text-lg font-medium">
          Tu as maîtrisé toutes les notions de ton parcours.
        </p>
      )}
    </Carte>
  );
}
