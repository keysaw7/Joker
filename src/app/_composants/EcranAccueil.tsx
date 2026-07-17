import Link from "next/link";
import { Bouton } from "./Bouton";

export function EcranAccueil() {
  return (
    <div className="flex flex-1 flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Japonais</h1>
        <p className="text-lg leading-relaxed text-texte-secondaire">
          Langue, écriture et culture — un parcours adapté à ton objectif, du
          diagnostic au cours sur mesure.
        </p>
      </header>

      <div>
        <Link href="/domaine/japonais">
          <Bouton>Commencer</Bouton>
        </Link>
      </div>
    </div>
  );
}
