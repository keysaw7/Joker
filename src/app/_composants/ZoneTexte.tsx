import type { TextareaHTMLAttributes } from "react";

interface ZoneTexteProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function ZoneTexte({ label, className = "", ...props }: ZoneTexteProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-texte-secondaire">
          {label}
        </label>
      )}
      <textarea
        className={`min-h-[120px] w-full resize-y rounded-lg border border-bordure bg-surface px-4 py-3 text-texte placeholder:text-texte-secondaire focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent ${className}`}
        {...props}
      />
    </div>
  );
}
