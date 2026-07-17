import type { Correction } from "@/core/domain";
import { Carte } from "../Carte";

interface CorrectionViewProps {
  correction: Correction;
}

export function CorrectionView({ correction }: CorrectionViewProps) {
  const ok = correction.analyse.correcte;

  return (
    <Carte className={ok ? "border-succes bg-green-50" : "border-accent/40 bg-fond"}>
      <p className={`text-sm font-medium ${ok ? "text-succes" : "text-accent"}`}>
        {ok ? "Correct" : "À retravailler"}
      </p>
      <p className="mt-2 text-sm leading-relaxed">{correction.resume}</p>

      {correction.items.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {correction.items.map((item) => (
            <li
              key={item.id}
              className="text-sm leading-snug text-texte-secondaire"
            >
              <span className={item.correct ? "text-succes" : "text-accent"}>
                {item.correct ? "✓" : "✗"}
              </span>{" "}
              {item.commentaire ? `${item.commentaire} — ` : ""}
              {item.obtenu != null && (
                <>
                  <span className="text-texte">« {item.obtenu} »</span>
                  {!item.correct && item.attendu != null && (
                    <> → attendu : « {item.attendu} »</>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {correction.pointsForts && correction.pointsForts.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-texte-secondaire">Points forts</p>
          <ul className="mt-1 list-disc pl-4 text-sm">
            {correction.pointsForts.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      {correction.aRetravailler && correction.aRetravailler.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-texte-secondaire">À retravailler</p>
          <ul className="mt-1 list-disc pl-4 text-sm">
            {correction.aRetravailler.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}
    </Carte>
  );
}
