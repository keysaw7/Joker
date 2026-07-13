import type { HTMLAttributes } from "react";

interface CarteProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export function Carte({
  interactive = false,
  children,
  className = "",
  ...props
}: CarteProps) {
  const interactiveStyles = interactive
    ? "cursor-pointer hover:border-[var(--color-accent)] hover:shadow-sm"
    : "";

  return (
    <div
      className={`rounded-[var(--radius-carte)] border border-[var(--color-bordure)] bg-[var(--color-surface)] p-6 ${interactiveStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
