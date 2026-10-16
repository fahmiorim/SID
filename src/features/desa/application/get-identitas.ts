import { cache } from "react";

import {
  getIdentitasDesa,
  type IdentitasDesa,
} from "@/features/desa/infrastructure/desa-repository";

/**
 * Identitas desa (di-cache per-permintaan). Dipakai oleh shell/layout sehingga
 * tidak di-query berulang kali dalam satu render.
 */
export const getIdentitas = cache(async (): Promise<IdentitasDesa | null> => {
  return getIdentitasDesa();
});
