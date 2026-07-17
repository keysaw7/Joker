import type { SupabaseClient } from "@supabase/supabase-js";
import type { ModeleApprenant, Observation } from "@/core/domain";
import type { PersistanceModeleApprentissage } from "@/core/ports";
import { sanitiserJsonPourPostgres } from "./sanitiserJson";

/** Persistance Supabase du Learning Model (snapshot + log observations). */
export function creerPersistanceModeleSupabase(
  client: SupabaseClient,
  userId: string,
): PersistanceModeleApprentissage {
  return {
    async sauvegarderModele(modele) {
      const { error } = await client.from("modeles_apprenant").upsert({
        eleve_id: modele.eleveId,
        user_id: userId,
        data: sanitiserJsonPourPostgres(modele),
        mise_a_jour: modele.miseAJour,
      });
      if (error) {
        throw new Error(error.message);
      }
    },

    async chargerModele(eleveId) {
      const { data, error } = await client
        .from("modeles_apprenant")
        .select("data")
        .eq("user_id", userId)
        .eq("eleve_id", eleveId)
        .maybeSingle();
      if (error) {
        throw new Error(error.message);
      }
      return (data?.data as ModeleApprenant | undefined) ?? null;
    },

    async ajouterObservation(observation) {
      const { error } = await client.from("observations_apprentissage").insert({
        id: observation.id,
        user_id: userId,
        eleve_id: observation.eleveId,
        type: observation.type,
        horodatage: observation.horodatage,
        data: sanitiserJsonPourPostgres(observation),
      });
      if (error) {
        throw new Error(error.message);
      }
    },

    async listerObservations(eleveId, limite = 1000) {
      const { data, error } = await client
        .from("observations_apprentissage")
        .select("data")
        .eq("user_id", userId)
        .eq("eleve_id", eleveId)
        .order("horodatage", { ascending: true })
        .limit(limite);
      if (error) {
        throw new Error(error.message);
      }
      return (data ?? []).map((row) => row.data as Observation);
    },
  };
}
