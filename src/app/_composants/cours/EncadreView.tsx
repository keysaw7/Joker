import type { VarianteEncadre } from "@/core/domain";
import { MarkdownView } from "./MarkdownView";

const STYLES: Record<
  VarianteEncadre,
  { bordure: string; fond: string; libelle: string }
> = {
  info: {
    bordure: "border-blue-200",
    fond: "bg-blue-50",
    libelle: "Info",
  },
  attention: {
    bordure: "border-amber-300",
    fond: "bg-amber-50",
    libelle: "Attention",
  },
  astuce: {
    bordure: "border-emerald-300",
    fond: "bg-emerald-50",
    libelle: "Astuce",
  },
  exemple: {
    bordure: "border-violet-200",
    fond: "bg-violet-50",
    libelle: "Exemple",
  },
};

interface EncadreViewProps {
  variante: VarianteEncadre;
  markdown: string;
  titre?: string;
}

export function EncadreView({ variante, markdown, titre }: EncadreViewProps) {
  const style = STYLES[variante];
  return (
    <div
      className={`rounded-lg border-l-4 px-4 py-3 ${style.bordure} ${style.fond}`}
    >
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-texte-secondaire">
        {titre ?? style.libelle}
      </p>
      <MarkdownView markdown={markdown} />
    </div>
  );
}
