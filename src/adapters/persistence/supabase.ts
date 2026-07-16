import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ChampsProfilElevePersistes,
  Objectif,
  ProfilApprenant,
  Roadmap,
  SessionPersistee,
} from "@/core/domain";
import type { Persistance } from "@/core/ports";
import { listerResumesSessions } from "./partage";

/** Stockage distant Supabase — scopé par utilisateur via RLS. */
export function creerPersistanceSupabase(
  client: SupabaseClient,
  userId: string,
): Persistance {
  return {
    async sauvegarderProfil(profil): Promise<void> {
      const { error } = await client.from("profils").upsert({
        objectif_id: profil.objectifId,
        user_id: userId,
        data: profil,
      });
      if (error) {
        throw new Error(error.message);
      }
    },

    async chargerProfil(objectifId) {
      const { data, error } = await client
        .from("profils")
        .select("data")
        .eq("user_id", userId)
        .eq("objectif_id", objectifId)
        .maybeSingle();
      if (error) {
        throw new Error(error.message);
      }
      return (data?.data as ProfilApprenant | undefined) ?? null;
    },

    async sauvegarderRoadmap(roadmap): Promise<void> {
      const { error } = await client.from("roadmaps").upsert({
        objectif_id: roadmap.objectifId,
        user_id: userId,
        data: roadmap,
      });
      if (error) {
        throw new Error(error.message);
      }
    },

    async chargerRoadmap(objectifId) {
      const { data, error } = await client
        .from("roadmaps")
        .select("data")
        .eq("user_id", userId)
        .eq("objectif_id", objectifId)
        .maybeSingle();
      if (error) {
        throw new Error(error.message);
      }
      return (data?.data as Roadmap | undefined) ?? null;
    },

    async sauvegarderObjectif(objectif): Promise<void> {
      const { error } = await client.from("objectifs").upsert({
        id: objectif.id,
        user_id: userId,
        domaine_id: objectif.domaineId,
        data: objectif,
        cree_le: objectif.creeLe,
      });
      if (error) {
        throw new Error(error.message);
      }
    },

    async chargerObjectifs(domaineId) {
      const { data, error } = await client
        .from("objectifs")
        .select("data")
        .eq("user_id", userId)
        .eq("domaine_id", domaineId);
      if (error) {
        throw new Error(error.message);
      }
      return (data ?? []).map((ligne) => ligne.data as Objectif);
    },

    async sauvegarderSession(session): Promise<void> {
      const { error } = await client.from("sessions").upsert({
        objectif_id: session.objectif.id,
        user_id: userId,
        domaine_id: session.objectif.domaineId,
        statut: session.statut,
        mise_a_jour: session.miseAJour,
        data: session,
      });
      if (error) {
        throw new Error(error.message);
      }

      await this.sauvegarderObjectif(session.objectif);
    },

    async chargerSession(objectifId) {
      const { data, error } = await client
        .from("sessions")
        .select("data")
        .eq("user_id", userId)
        .eq("objectif_id", objectifId)
        .maybeSingle();
      if (error) {
        throw new Error(error.message);
      }
      if (!data?.data) {
        return null;
      }
      const session = data.data as SessionPersistee;
      return { ...session, archive: session.archive ?? null };
    },

    async supprimerSession(objectifId): Promise<void> {
      const suppressions = await Promise.all([
        client.from("sessions").delete().eq("user_id", userId).eq("objectif_id", objectifId),
        client.from("profils").delete().eq("user_id", userId).eq("objectif_id", objectifId),
        client.from("roadmaps").delete().eq("user_id", userId).eq("objectif_id", objectifId),
        client.from("objectifs").delete().eq("user_id", userId).eq("id", objectifId),
      ]);

      for (const { error } of suppressions) {
        if (error) {
          throw new Error(error.message);
        }
      }
    },

    async listerSessions(domaineId) {
      const { data, error } = await client
        .from("sessions")
        .select("data")
        .eq("user_id", userId)
        .eq("domaine_id", domaineId);
      if (error) {
        throw new Error(error.message);
      }
      const sessions = (data ?? []).map((ligne) => ligne.data as SessionPersistee);
      return listerResumesSessions(sessions, domaineId);
    },

    async chargerToutesSessions() {
      const { data, error } = await client
        .from("sessions")
        .select("data")
        .eq("user_id", userId)
        .order("mise_a_jour", { ascending: false });
      if (error) {
        throw new Error(error.message);
      }
      return (data ?? []).map((ligne) => ligne.data as SessionPersistee);
    },

    async chargerProfilEleve() {
      const { data, error } = await client
        .from("profil_eleve")
        .select("data")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) {
        throw new Error(error.message);
      }
      if (!data?.data) {
        return null;
      }
      return data.data as ChampsProfilElevePersistes;
    },

    async sauvegarderProfilEleve(champs): Promise<void> {
      const { error } = await client.from("profil_eleve").upsert({
        user_id: userId,
        data: champs,
        mise_a_jour: new Date().toISOString(),
      });
      if (error) {
        throw new Error(error.message);
      }
    },
  };
}
