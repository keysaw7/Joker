import type { EtapeCours } from "@/core/domain";
import { MarkdownView } from "./MarkdownView";

interface EtapesViewProps {
  etapes: readonly EtapeCours[];
}

export function EtapesView({ etapes }: EtapesViewProps) {
  return (
    <ol className="flex flex-col gap-4">
      {etapes.map((etape, index) => (
        <li key={index} className="flex gap-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
            {index + 1}
          </span>
          <div className="flex flex-1 flex-col gap-1">
            <p className="font-medium">{etape.titre}</p>
            <MarkdownView markdown={etape.markdown} />
          </div>
        </li>
      ))}
    </ol>
  );
}
