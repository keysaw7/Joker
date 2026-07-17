import type { ModeleApprenant } from "@/core/domain";
import { moyenneCroyance } from "@/core/domain";
import { SEUIL_MAITRISE_MOYENNE } from "./projeterProfil";

/**
 * Projections narratives dérivées des croyances — jamais stockées comme étiquettes fixes.
 * Utilisées pour alimenter l'UI ProfilEleve sans figer le modèle.
 */
export function forcesProbablesDepuisModele(
  modele: ModeleApprenant,
  limite = 5,
): readonly string[] {
  return Object.values(modele.croyances)
    .filter((c) => c.nObservations > 0 && moyenneCroyance(c) >= SEUIL_MAITRISE_MOYENNE)
    .sort((a, b) => moyenneCroyance(b) - moyenneCroyance(a))
    .slice(0, limite)
    .map(
      (c) =>
        `Maîtrise probable de « ${c.noeudId} » (${Math.round(moyenneCroyance(c) * 100)} %)`,
    );
}

export function faiblessesProbablesDepuisModele(
  modele: ModeleApprenant,
  limite = 5,
): readonly string[] {
  return Object.values(modele.croyances)
    .filter((c) => c.nObservations > 0 && moyenneCroyance(c) < 0.4)
    .sort((a, b) => moyenneCroyance(a) - moyenneCroyance(b))
    .slice(0, limite)
    .map(
      (c) =>
        `Fragilité probable sur « ${c.noeudId} » (${Math.round(moyenneCroyance(c) * 100)} %)`,
    );
}

export function formatsEfficacesDepuisModele(
  modele: ModeleApprenant,
): readonly string[] {
  return Object.entries(modele.preferences.efficaciteParFormat)
    .filter(([, c]) => moyenneCroyance(c) >= 0.6)
    .map(([format, c]) => `format:${format}~${Math.round(moyenneCroyance(c) * 100)}`);
}
