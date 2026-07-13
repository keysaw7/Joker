import type { ButtonHTMLAttributes } from "react";

interface BoutonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: "primaire" | "secondaire";
  enCours?: boolean;
}

export function Bouton({
  variante = "primaire",
  enCours = false,
  children,
  className = "",
  disabled,
  ...props
}: BoutonProps) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50";
  const styles =
    variante === "primaire"
      ? "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]"
      : "border border-[var(--color-bordure)] bg-[var(--color-surface)] text-[var(--color-texte)] hover:bg-[var(--color-fond)]";

  return (
    <button
      className={`${base} ${styles} ${className}`}
      disabled={disabled || enCours}
      {...props}
    >
      {enCours ? "Chargement…" : children}
    </button>
  );
}
