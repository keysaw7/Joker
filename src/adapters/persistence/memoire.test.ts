import { describe, expect, it } from "vitest";
import { creerPersistanceMemoire } from "@/adapters/persistence/memoire";
import { champsProfilEleveInitiaux } from "@/core/domain/profilEleve";

describe("creerPersistanceMemoire — profil élève", () => {
  it("sauvegarde et recharge les champs persistés du profil élève", async () => {
    const persistance = creerPersistanceMemoire();
    const champs = {
      ...champsProfilEleveInitiaux(),
      typeMemoire: "auditive" as const,
      pointsForts: ["écoute active"],
      niveauxParDomaine: { japonais: 55 },
    };

    expect(await persistance.chargerProfilEleve()).toBeNull();

    await persistance.sauvegarderProfilEleve(champs);

    expect(await persistance.chargerProfilEleve()).toEqual(champs);
  });

  it("charge toutes les sessions triées par date décroissante", async () => {
    const persistance = creerPersistanceMemoire();
    const sessionAncienne = {
      objectif: {
        id: "obj-1",
        domaineId: "japonais",
        intitule: "Ancien",
        creeLe: "2026-01-01T00:00:00.000Z",
      },
      statut: "diagnostic" as const,
      miseAJour: "2026-07-10T10:00:00.000Z",
      etatParcours: null,
      etatCycle: null,
      archive: null,
    };
    const sessionRecente = {
      ...sessionAncienne,
      objectif: { ...sessionAncienne.objectif, id: "obj-2", intitule: "Récent" },
      miseAJour: "2026-07-14T10:00:00.000Z",
    };

    await persistance.sauvegarderSession(sessionAncienne);
    await persistance.sauvegarderSession(sessionRecente);

    const sessions = await persistance.chargerToutesSessions();
    expect(sessions).toHaveLength(2);
    expect(sessions[0]?.objectif.id).toBe("obj-2");
    expect(sessions[1]?.objectif.id).toBe("obj-1");
  });

  it("supprime une session et ses données associées", async () => {
    const persistance = creerPersistanceMemoire();
    const session = {
      objectif: {
        id: "obj-1",
        domaineId: "japonais",
        intitule: "À supprimer",
        creeLe: "2026-01-01T00:00:00.000Z",
      },
      statut: "cycle" as const,
      miseAJour: "2026-07-10T10:00:00.000Z",
      etatParcours: null,
      etatCycle: null,
      archive: null,
    };

    await persistance.sauvegarderSession(session);
    await persistance.sauvegarderProfil({
      objectifId: "obj-1",
      acquis: [],
      competences: [],
      lacunes: [],
      erreursFrequentes: [],
      preferencesPedagogiques: [],
      notionsMaitrisees: [],
      niveauEstime: null,
      miseAJour: "2026-07-10T10:00:00.000Z",
    });

    await persistance.supprimerSession("obj-1");

    expect(await persistance.chargerSession("obj-1")).toBeNull();
    expect(await persistance.chargerProfil("obj-1")).toBeNull();
    expect(await persistance.listerSessions("japonais")).toHaveLength(0);
    expect(await persistance.chargerObjectifs("japonais")).toHaveLength(0);
  });
});
