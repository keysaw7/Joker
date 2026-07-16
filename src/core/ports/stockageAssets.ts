import type { AssetImage } from "@/core/domain";

/**
 * Stocke les assets média (images, etc.) et retourne une URL accessible.
 */
export interface StockageAssets {
  televerser(
    bytes: Uint8Array,
    mediaType: string,
    cle: string,
  ): Promise<AssetImage>;
}
