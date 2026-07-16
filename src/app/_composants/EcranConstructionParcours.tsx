interface EcranConstructionParcoursProps {
  /** Message principal affiché sous le spinner. */
  message?: string;
  /** Précision secondaire optionnelle. */
  detail?: string;
}

export function EcranConstructionParcours({
  message = "Préparation de ton parcours…",
  detail = "Analyse de tes réponses, construction du programme, puis démarrage de la première notion.",
}: EcranConstructionParcoursProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-bordure border-t-accent"
        aria-hidden
      />
      <p className="animate-pulse text-lg text-texte-secondaire">{message}</p>
      {detail && <p className="max-w-md text-sm text-texte-secondaire">{detail}</p>}
    </div>
  );
}
