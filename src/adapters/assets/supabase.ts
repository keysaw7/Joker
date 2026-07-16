import type { SupabaseClient } from "@supabase/supabase-js";
import type { AssetImage } from "@/core/domain";
import type { StockageAssets } from "@/core/ports";

const BUCKET = "cours-assets";

/** Stockage Supabase Storage pour les assets de cours. */
export function creerStockageAssetsSupabase(
  client: SupabaseClient,
  userId: string,
): StockageAssets {
  return {
    async televerser(bytes, mediaType, cle): Promise<AssetImage> {
      const chemin = `${userId}/${cle}`;
      const { error } = await client.storage.from(BUCKET).upload(chemin, bytes, {
        contentType: mediaType,
        upsert: true,
      });

      if (error) {
        throw new Error(`Échec du téléversement : ${error.message}`);
      }

      const { data } = client.storage.from(BUCKET).getPublicUrl(chemin);

      return {
        id: chemin,
        url: data.publicUrl,
        mediaType,
      };
    },
  };
}
