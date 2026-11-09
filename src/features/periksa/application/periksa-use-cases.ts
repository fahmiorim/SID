import "server-only";

import { requirePermission } from "@/lib/dal";

import { PERIKSA_RESOURCE, ringkasPemeriksaan } from "../domain/periksa";
import { kumpulkanTemuan } from "../infrastructure/periksa-repository";

/**
 * Menjalankan pemeriksaan data untuk satu desa.
 *
 * Hanya membaca; `villageId` berasal dari sesi (lewat server action), bukan
 * input klien, sehingga hasil tidak dapat menembus tenant lain.
 */
export async function jalankanPemeriksaan(villageId: number) {
  await requirePermission(PERIKSA_RESOURCE, "read");

  const temuan = await kumpulkanTemuan(villageId);
  return { temuan, ringkasan: ringkasPemeriksaan(temuan) };
}
