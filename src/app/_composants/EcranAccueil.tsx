import { DOMAINES } from "@/app/_data/domaines";
import { Carte } from "./Carte";

interface EcranAccueilProps {
  onChoisirDomaine: (domaineId: string) => void;
}

export function EcranAccueil({ onChoisirDomaine }: EcranAccueilProps) {
  return (
    <div className="flex flex-1 flex-col gap-10">
      <header className="flex flex-col gap-3">
        <p className="text-lg leading-relaxed text-texte-secondaire">
          Apprends n&apos;importe quel domaine de la manière la plus efficace possible.
          Choisis un domaine pour commencer.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
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
              <p className="mt-1 text-sm text-texte-secondaire">
                {domaine.description}
              </p>
            )}
          </Carte>
        ))}
      </div>
    </div>
  );
}
