import { EcranAttente } from "./attente/EcranAttente";

/** Alias vers l'écran d'attente « construction du parcours ». */
export function EcranConstructionParcours() {
  return <EcranAttente phase="constructionParcours" />;
}
