import type { TextareaHTMLAttributes } from "react";

interface ZoneTexteProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function ZoneTexte({ label, className = "", ...props }: ZoneTexteProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-[var(--color-texte-secondaire)]">
          {label}
        </label>
      )}
      <textarea
        className={`min-h-[120px] w-full resize-y rounded-lg border border-[var(--color-bordure)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-texte)] placeholder:text-[var(--color-texte-secondaire)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] ${className}`}
        {...props}
      />
    </div>
  );
}
