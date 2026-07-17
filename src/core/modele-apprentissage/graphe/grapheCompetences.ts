import type {
  EtatGrapheCompetences,
  NoeudConnaissance,
  RelationConnaissance,
  Roadmap,
} from "@/core/domain";
import { etatGrapheVide } from "@/core/domain";
import type { ServiceGrapheCompetences } from "@/core/ports";

function indexNoeuds(
  noeuds: readonly NoeudConnaissance[],
): Map<string, NoeudConnaissance> {
  return new Map(noeuds.map((n) => [n.id, n]));
}

export function creerServiceGrapheCompetences(): ServiceGrapheCompetences {
  return {
    noeud(etat, id) {
      return etat.noeuds.find((n) => n.id === id) ?? null;
    },

    prerequis(etat, id) {
      return etat.relations
        .filter((r) => r.type === "prerequis_de" && r.vers === id)
        .map((r) => r.de);
    },

    dependants(etat, id) {
      return etat.relations
        .filter((r) => r.type === "prerequis_de" && r.de === id)
        .map((r) => r.vers);
    },

    chemin(etat, de, vers) {
      if (de === vers) {
        return [de];
      }
      const adj = new Map<string, string[]>();
      for (const r of etat.relations) {
        if (r.type !== "prerequis_de") continue;
        const liste = adj.get(r.de) ?? [];
        liste.push(r.vers);
        adj.set(r.de, liste);
      }

      const file: string[][] = [[de]];
      const vus = new Set<string>([de]);
      while (file.length > 0) {
        const cheminCourant = file.shift()!;
        const dernier = cheminCourant[cheminCourant.length - 1]!;
        for (const voisin of adj.get(dernier) ?? []) {
          if (vus.has(voisin)) continue;
          const suivant = [...cheminCourant, voisin];
          if (voisin === vers) {
            return suivant;
          }
          vus.add(voisin);
          file.push(suivant);
        }
      }
      return [];
    },

    fusionnerDepuisRoadmap(etat, roadmap, domaineId) {
      const noeuds = indexNoeuds(etat.noeuds);
      const relations = [...etat.relations];
      const cleRelation = (r: RelationConnaissance) =>
        `${r.type}|${r.de}|${r.vers}`;
      const relationsVues = new Set(relations.map(cleRelation));

      for (const notion of roadmap.notions) {
        if (!noeuds.has(notion.id)) {
          noeuds.set(notion.id, {
            id: notion.id,
            type: "notion",
            libelle: notion.titre,
            domaineId,
          });
        }

        for (const prereqId of notion.prerequisIds) {
          if (!noeuds.has(prereqId)) {
            const prereqNotion = roadmap.notions.find((n) => n.id === prereqId);
            noeuds.set(prereqId, {
              id: prereqId,
              type: "notion",
              libelle: prereqNotion?.titre ?? prereqId,
              domaineId,
            });
          }
          const relation: RelationConnaissance = {
            de: prereqId,
            vers: notion.id,
            type: "prerequis_de",
            poids: 1,
          };
          const cle = cleRelation(relation);
          if (!relationsVues.has(cle)) {
            relationsVues.add(cle);
            relations.push(relation);
          }
        }
      }

      return {
        domaineId: etat.domaineId || domaineId,
        noeuds: [...noeuds.values()],
        relations,
      };
    },

    ajouterNoeud(etat, noeud) {
      if (etat.noeuds.some((n) => n.id === noeud.id)) {
        return etat;
      }
      return {
        ...etat,
        noeuds: [...etat.noeuds, noeud],
      };
    },
  };
}

export function grapheDepuisRoadmap(
  roadmap: Roadmap,
  domaineId: string,
): EtatGrapheCompetences {
  const service = creerServiceGrapheCompetences();
  return service.fusionnerDepuisRoadmap(
    etatGrapheVide(domaineId),
    roadmap,
    domaineId,
  );
}
