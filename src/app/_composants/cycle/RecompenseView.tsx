import type { Correction, Recompense } from "@/core/domain";
import { Carte } from "../Carte";
import { CorrectionView } from "./CorrectionView";

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
    <div className="flex flex-col gap-4 contenu-lecture mx-auto">
      <Carte className="text-center">
        <p className="text-2xl font-semibold text-succes">
          {recompense.message}
        </p>
        {termine && (
          <p className="mt-4 text-lg font-medium">
            Tu as maîtrisé toutes les notions de ton parcours.
          </p>
        )}
      </Carte>
      {correctionPrecedente && <CorrectionView correction={correctionPrecedente} />}
    </div>
  );
}
