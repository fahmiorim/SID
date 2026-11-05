import "server-only";

import { headers } from "next/headers";
import { cache } from "react";

import { susunPetaDesa, villageIdDariHost } from "@/features/desa/domain/tenant";
import {
  getFirstVillageId,
  getIdentitasDesa,
  listVillageDomains,
  type IdentitasDesa,
} from "@/features/desa/infrastructure/desa-repository";

/**
 * Ekstrak tenant (villageId) dari request berdasarkan host.
 *
 * Mengikuti aturan multi-tenant yang sama dengan `getIdentitasFromRequest`:
 * domain persis → alias `www` → fallback hanya bila instalasi satu-desa.
 *
 * @throws {Error} Jika host tidak valid atau desa tidak ditemukan
 */
export const getTenantFromRequest = cache(async (): Promise<IdentitasDesa> => {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  const peta = susunPetaDesa(await listVillageDomains());
  const villageId = villageIdDariHost(host, peta);

  if (villageId !== null) {
    const desa = await getIdentitasDesa(villageId);
    if (desa) return desa;
  }

  // Fallback: mode satu-desa
  const fallbackId = await getFirstVillageId();
  if (fallbackId !== null) {
    const desa = await getIdentitasDesa(fallbackId);
    if (desa) return desa;
  }

  throw new Error("Desa tidak valid untuk host ini");
});
