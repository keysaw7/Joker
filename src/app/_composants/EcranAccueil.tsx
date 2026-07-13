import { DOMAINES } from "@/app/_data/domaines";
import type { SelectionModele } from "@/adapters/ai/fournisseurs";
import { Carte } from "./Carte";
import { SelecteurModele } from "./SelecteurModele";

interface EcranAccueilProps {
  selection: SelectionModele;
  onChangerSelection: (selection: SelectionModele) => void;
  onChoisirDomaine: (domaineId: string) => void;
}

export function EcranAccueil({
  selection,
  onChangerSelection,
  onChoisirDomaine,
}: EcranAccueilProps) {
  return (
    <div className="flex flex-1 flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Joker</h1>
        <p className="text-lg leading-relaxed text-[var(--color-texte-secondaire)]">
          Apprends n&apos;importe quel domaine de la manière la plus efficace possible.
          Choisis un domaine pour commencer.
        </p>
      </header>

      <SelecteurModele selection={selection} onChanger={onChangerSelection} />

      <div className="grid gap-3">
        {DOMAINES.map((domaine) => (
          <Carte
            key={domaine.id}
            interactive
            onClick={() => onChoisirDomaine(domaine.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onChoisirDomaine(domaine.id);
              }
            }}
          >
            <h2 className="text-lg font-medium">{domaine.nom}</h2>
            {domaine.description && (
              <p className="mt-1 text-sm text-[var(--color-texte-secondaire)]">
                {domaine.description}
              </p>
            )}
          </Carte>
        ))}
      </div>
    </div>
  );
}
