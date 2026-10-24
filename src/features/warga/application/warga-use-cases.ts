import "server-only";

import { headers } from "next/headers";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { PENDUDUK_RESOURCE } from "@/features/penduduk/domain/penduduk";
import type {
  KredensialWarga,
  WargaAccountSummary,
  WargaProfile,
} from "@/features/warga/domain/warga";
import {
  clearMustChangePin,
  createWargaAccount,
  findResidentForAccount,
  findWargaAccount,
  generatePin,
  getWargaProfile,
  listWargaAccountsByResidentIds,
  resetWargaPin,
  usernameExists,
  type ResidentAccountCandidate,
} from "@/features/warga/infrastructure/warga-repository";
import { auth } from "@/lib/auth";
import { requirePermission, requireWarga } from "@/lib/dal";
import { conflict, notFound, validationError } from "@/lib/errors";

/** Resident valid: milik desa, hidup, dan punya NIK 16 digit. */
async function residentSiapAkun(
  villageId: number,
  residentId: number,
): Promise<ResidentAccountCandidate & { nationalId: string }> {
  const resident = await findResidentForAccount(villageId, residentId);
  if (!resident) throw notFound("Data penduduk tidak ditemukan.");

  if (resident.lifeStatus !== "alive") {
    throw conflict("Akun warga hanya dapat dibuat untuk penduduk berstatus hidup.");
  }

  if (!resident.nationalId || !/^\d{16}$/.test(resident.nationalId)) {
    throw conflict("Penduduk harus memiliki NIK 16 digit sebelum dibuatkan akun.");
  }

  return { ...resident, nationalId: resident.nationalId };
}

/** Operator membuat akun warga; PIN dikembalikan sekali untuk ditampilkan. */
export async function buatAkunWargaData(residentId: number): Promise<KredensialWarga> {
  const user = await requirePermission(PENDUDUK_RESOURCE, "update");
  const villageId = await resolveVillageId(user);
  const resident = await residentSiapAkun(villageId, residentId);

  const existing = await findWargaAccount(villageId, residentId);
  if (existing) throw conflict("Penduduk ini sudah memiliki akun warga.");

  if (await usernameExists(resident.nationalId)) {
    throw conflict("NIK tersebut sudah dipakai akun lain. Periksa data pengguna.");
  }

  const pin = generatePin();

  try {
    await createWargaAccount({
      villageId,
      residentId,
      name: resident.name,
      nationalId: resident.nationalId,
      pin,
    });
  } catch (error) {
    if ((error as { code?: string }).code === "ER_DUP_ENTRY") {
      throw conflict("NIK atau akun warga untuk penduduk ini sudah terdaftar.");
    }
    throw error;
  }

  return { username: resident.nationalId, pin };
}

/** Operator mereset PIN warga; PIN baru wajib diganti saat login. */
export async function resetPinWargaData(residentId: number): Promise<KredensialWarga> {
  const user = await requirePermission(PENDUDUK_RESOURCE, "update");
  const villageId = await resolveVillageId(user);
  const resident = await residentSiapAkun(villageId, residentId);

  const account = await findWargaAccount(villageId, residentId);
  if (!account) throw conflict("Penduduk ini belum memiliki akun warga.");

  const pin = generatePin();
  await resetWargaPin(account.userId, pin);

  return { username: account.username || resident.nationalId, pin };
}

/** Data akun untuk lencana/aksi pada tabel penduduk. */
export async function listWargaAccountsForResidents(
  residentIds: readonly number[],
): Promise<Map<number, WargaAccountSummary>> {
  const user = await requirePermission(PENDUDUK_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  return listWargaAccountsByResidentIds(villageId, residentIds);
}

/** Profil warga yang sedang login. */
export async function getProfilWargaData(): Promise<WargaProfile> {
  const user = await requireWarga();
  const villageId = await resolveVillageId(user);
  const profile = await getWargaProfile(villageId, user.residentId);

  if (!profile) throw notFound("Profil warga tidak ditemukan.");
  return profile;
}

/**
 * Ubah PIN warga. Menggunakan `changePassword` better-auth agar hash dan
 * pencabutan sesi lain ditangani secara konsisten.
 */
export async function ubahPinWargaData(input: { pinLama: string; pinBaru: string }): Promise<void> {
  const user = await requireWarga();

  try {
    await auth.api.changePassword({
      headers: await headers(),
      body: {
        currentPassword: input.pinLama,
        newPassword: input.pinBaru,
        revokeOtherSessions: true,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "APIError") {
      throw validationError("PIN lama tidak sesuai.", {
        pinLama: ["PIN lama tidak sesuai."],
      });
    }
    throw error;
  }

  await clearMustChangePin(user.id);
}
