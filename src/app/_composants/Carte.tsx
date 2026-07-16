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
    ? "cursor-pointer hover:border-accent hover:shadow-sm"
    : "";

  return (
    <div
      className={`rounded-carte border border-bordure bg-surface p-6 ${interactiveStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
