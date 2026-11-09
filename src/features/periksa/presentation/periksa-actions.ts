"use server";

import { getCurrentUser } from "@/lib/dal";

import { jalankanPemeriksaan } from "../application/periksa-use-cases";

/** Memuat hasil pemeriksaan untuk desa pengguna yang sedang login. */
export async function listPemeriksaanAction() {
  const user = await getCurrentUser();
  if (!user?.villageId) throw new Error("Desa tidak ditemukan");
  return jalankanPemeriksaan(user.villageId);
}
