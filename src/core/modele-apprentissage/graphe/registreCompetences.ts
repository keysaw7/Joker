import type { NoeudConnaissance } from "@/core/domain";
import type { RegistreCompetences } from "@/core/ports";

function normaliserCle(valeur: string): string {
  return valeur
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function idCanonique(
  domaineId: string,
  competenceIdPropose: string,
  libelle: string,
): string {
  const depuisId = normaliserCle(competenceIdPropose);
  if (depuisId.length >= 2) {
    return `${domaineId}:${depuisId}`;
  }
  const depuisLibelle = normaliserCle(libelle);
  return `${domaineId}:${depuisLibelle || "competence"}`;
}

/** Registre en mémoire — IDs stables pour la durée du processus (et sérialisable via lister). */
export function creerRegistreCompetencesMemoire(
  initial: readonly NoeudConnaissance[] = [],
): RegistreCompetences {
  const parCle = new Map<string, NoeudConnaissance>();

  for (const noeud of initial) {
    parCle.set(`${noeud.domaineId}:${noeud.id}`, noeud);
    // Aussi indexé par id absolu si déjà préfixé
    parCle.set(noeud.id, noeud);
  }

  return {
    resoudre(domaineId, competenceIdPropose, libelle) {
      const id = idCanonique(domaineId, competenceIdPropose, libelle);
      const existant = parCle.get(id);
      if (existant) {
        return { id: existant.id, libelle: existant.libelle, cree: false };
      }

      const noeud: NoeudConnaissance = {
        id,
        type: "competence",
        libelle: libelle.trim() || competenceIdPropose,
        domaineId,
      };
      parCle.set(id, noeud);
      return { id: noeud.id, libelle: noeud.libelle, cree: true };
    },

    obtenir(domaineId, competenceId) {
      return (
        parCle.get(competenceId) ??
        parCle.get(`${domaineId}:${competenceId}`) ??
        null
      );
    },

    lister(domaineId) {
      const vus = new Set<string>();
      const resultat: NoeudConnaissance[] = [];
      for (const noeud of parCle.values()) {
        if (noeud.domaineId !== domaineId || vus.has(noeud.id)) {
          continue;
        }
        vus.add(noeud.id);
        resultat.push(noeud);
      }
      return resultat;
    },
  };
}
