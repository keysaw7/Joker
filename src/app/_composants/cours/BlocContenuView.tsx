import type { BlocContenu } from "@/core/domain";
import { AnalogieView } from "./AnalogieView";
import { ComparaisonView } from "./ComparaisonView";
import { EncadreView } from "./EncadreView";
import { EtapesView } from "./EtapesView";
import { GraphiqueView } from "./GraphiqueView";
import { ImageView } from "./ImageView";
import { MarkdownView } from "./MarkdownView";
import { MermaidView } from "./MermaidView";
import { QuizFlashView } from "./QuizFlashView";
import { TableauView } from "./TableauView";

interface BlocContenuViewProps {
  bloc: BlocContenu;
}

export function BlocContenuView({ bloc }: BlocContenuViewProps) {
  switch (bloc.type) {
    case "texte":
      return <MarkdownView markdown={bloc.markdown} />;
    case "encadre":
      return (
        <EncadreView
          variante={bloc.variante}
          markdown={bloc.markdown}
          titre={bloc.titre}
        />
      );
    case "analogie":
      return (
        <AnalogieView
          source={bloc.source}
          cible={bloc.cible}
          explication={bloc.explication}
        />
      );
    case "comparaison":
      return <ComparaisonView entetes={bloc.entetes} lignes={bloc.lignes} />;
    case "tableau":
      return (
        <div className="flex flex-col gap-2">
          <TableauView entetes={bloc.entetes} lignes={bloc.lignes} />
          {bloc.legende && (
            <p className="text-sm italic text-texte-secondaire">
              {bloc.legende}
            </p>
          )}
        </div>
      );
    case "schema":
      return <MermaidView mermaid={bloc.mermaid} legende={bloc.legende} />;
    case "graphique":
      return (
        <div className="flex flex-col gap-2">
          <GraphiqueView graphique={bloc.graphique} />
          {bloc.legende && (
            <p className="text-sm italic text-texte-secondaire">
              {bloc.legende}
            </p>
          )}
        </div>
      );
    case "image":
      return (
        <div className="flex flex-col gap-2">
          <ImageView url={bloc.url} alt={bloc.alt} />
          {bloc.legende && (
            <p className="text-sm italic text-texte-secondaire">
              {bloc.legende}
            </p>
          )}
        </div>
      );
    case "etapes":
      return <EtapesView etapes={bloc.etapes} />;
    case "quizFlash":
      return (
        <QuizFlashView
          question={bloc.question}
          options={bloc.options}
          bonneReponse={bloc.bonneReponse}
          explication={bloc.explication}
        />
      );
  }
}
