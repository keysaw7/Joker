export function ChargementInvisible() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-bordure)] border-t-[var(--color-accent)]" />
      <p className="text-lg text-[var(--color-texte-secondaire)]">
        Construction de ton parcours…
      </p>
    </div>
  );
}
