import type { AssetImage } from "@/core/domain";
import type { StockageAssets } from "@/core/ports";

const magasin = new Map<string, AssetImage>();

/** Stockage en mémoire (data-URL) — pour tests et développement hors ligne. */
export function creerStockageAssetsMemoire(): StockageAssets {
  return {
    async televerser(bytes, mediaType, cle): Promise<AssetImage> {
      const base64 = Buffer.from(bytes).toString("base64");
      const url = `data:${mediaType};base64,${base64}`;
      const asset: AssetImage = {
        id: cle,
        url,
        mediaType,
      };
      magasin.set(cle, asset);
      return asset;
    },
  };
}

export function viderStockageAssetsMemoire(): void {
  magasin.clear();
}
