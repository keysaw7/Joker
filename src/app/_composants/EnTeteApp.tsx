import { Bouton } from "./Bouton";

interface EnTeteAppProps {
  onAccueil: () => void;
  surAccueil?: boolean;
}

function IconeMaison() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function EnTeteApp({ onAccueil, surAccueil = false }: EnTeteAppProps) {
  return (
    <header className="flex items-center justify-between border-b border-[var(--color-bordure)] pb-4">
      <button
        type="button"
        onClick={onAccueil}
        className="text-lg font-semibold tracking-tight transition-colors hover:text-[var(--color-accent)]"
      >
        Joker
      </button>

      {!surAccueil && (
        <Bouton variante="secondaire" onClick={onAccueil} className="gap-2">
          <IconeMaison />
          Accueil
        </Bouton>
      )}
    </header>
  );
}
