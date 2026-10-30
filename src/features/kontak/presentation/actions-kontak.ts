"use server";

import { revalidatePath } from "next/cache";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  GRUP_KONTAK_RESOURCE,
  KONTAK_RESOURCE,
  kontakGrupSchema,
  kontakSchema,
} from "@/features/kontak/domain/kontak";
import {
  KOLOM_IMPOR_KONTAK,
  type BarisImporKontak,
  type KunciImporKontak,
} from "@/features/kontak/domain/kontak-berkas";
import {
  addAnggotaGrup,
  createKontak,
  createKontakGrup,
  deleteKontak,
  deleteKontakGrup,
  listAnggotaGrupDetail,
  listKontak,
  listKontakGrup,
  removeAnggotaGrup,
  updateKontak,
  updateKontakGrup,
} from "@/features/kontak/infrastructure/kontak-repository";
import { hasPermission } from "@/features/rbac/application/authorization";
import { errorState, successState, type ActionState } from "@/lib/action-state";
import { verifySession } from "@/lib/dal";
import { bacaImporDariFormData } from "@/lib/impor-berkas";

export async function saveKontakAction(formData: FormData) {
  const user = await verifySession();
  if (!hasPermission(user.permissions, KONTAK_RESOURCE, "update")) {
    return { ok: false, message: "Tidak memiliki izin." };
  }
  const villageId = await resolveVillageId(user);

  const raw = {
    id: formData.get("id") ? Number(formData.get("id")) : undefined,
    villageId,
    nama: String(formData.get("nama") ?? "").trim(),
    telepon: formData.get("telepon") ? String(formData.get("telepon")) : "",
    email: formData.get("email") ? String(formData.get("email")) : "",
    telegram: formData.get("telegram") ? String(formData.get("telegram")) : "",
    hubungWarga: formData.get("hubungWarga") ? String(formData.get("hubungWarga")) : "Telegram",
    keterangan: formData.get("keterangan") ? String(formData.get("keterangan")) : "",
    residentId: formData.get("residentId") ? Number(formData.get("residentId")) : undefined,
  };

  const parsed = kontakSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  try {
    if (parsed.data.id) {
      await updateKontak(parsed.data.id, villageId, {
        nama: parsed.data.nama,
        telepon: parsed.data.telepon || null,
        email: parsed.data.email || null,
        telegram: parsed.data.telegram || null,
        hubungWarga: parsed.data.hubungWarga || "Telegram",
        keterangan: parsed.data.keterangan || null,
        residentId: parsed.data.residentId,
      });
    } else {
      await createKontak({
        villageId,
        nama: parsed.data.nama,
        telepon: parsed.data.telepon || null,
        email: parsed.data.email || null,
        telegram: parsed.data.telegram || null,
        hubungWarga: parsed.data.hubungWarga || "Telegram",
        keterangan: parsed.data.keterangan || null,
        residentId: parsed.data.residentId,
      });
    }
    revalidatePath("/hubung-warga/daftar-kontak");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Gagal menyimpan kontak." };
  }
}

export async function deleteKontakAction(id: number) {
  const user = await verifySession();
  if (!hasPermission(user.permissions, KONTAK_RESOURCE, "delete")) {
    return { ok: false, message: "Tidak memiliki izin." };
  }
  const villageId = await resolveVillageId(user);
  try {
    await deleteKontak(id, villageId);
    revalidatePath("/hubung-warga/daftar-kontak");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Gagal menghapus kontak." };
  }
}

export async function saveKontakGrupAction(formData: FormData) {
  const user = await verifySession();
  if (!hasPermission(user.permissions, GRUP_KONTAK_RESOURCE, "update")) {
    return { ok: false, message: "Tidak memiliki izin." };
  }
  const villageId = await resolveVillageId(user);

  const parsed = kontakGrupSchema.safeParse({
    id: formData.get("id") ? Number(formData.get("id")) : undefined,
    villageId,
    namaGrup: String(formData.get("namaGrup") ?? "").trim(),
    keterangan: formData.get("keterangan") ? String(formData.get("keterangan")) : "",
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  try {
    if (parsed.data.id) {
      await updateKontakGrup(parsed.data.id, villageId, {
        namaGrup: parsed.data.namaGrup,
        keterangan: parsed.data.keterangan || null,
      });
    } else {
      await createKontakGrup({
        villageId,
        namaGrup: parsed.data.namaGrup,
        keterangan: parsed.data.keterangan || null,
      });
    }
    revalidatePath("/hubung-warga/grup-kontak");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Gagal menyimpan grup." };
  }
}

export async function deleteKontakGrupAction(id: number) {
  const user = await verifySession();
  if (!hasPermission(user.permissions, GRUP_KONTAK_RESOURCE, "delete")) {
    return { ok: false, message: "Tidak memiliki izin." };
  }
  const villageId = await resolveVillageId(user);
  try {
    await deleteKontakGrup(id, villageId);
    revalidatePath("/hubung-warga/grup-kontak");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Gagal menghapus grup." };
  }
}

export async function listAnggotaGrupAction(grupId: number) {
  const user = await verifySession();
  if (!hasPermission(user.permissions, GRUP_KONTAK_RESOURCE, "read")) {
    return { ok: false, message: "Tidak memiliki izin.", rows: [] };
  }
  const villageId = await resolveVillageId(user);
  try {
    return { ok: true, rows: await listAnggotaGrupDetail(villageId, grupId) };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Gagal memuat anggota.",
      rows: [],
    };
  }
}

export async function addAnggotaGrupAction(formData: FormData) {
  const user = await verifySession();
  if (!hasPermission(user.permissions, GRUP_KONTAK_RESOURCE, "update")) {
    return { ok: false, message: "Tidak memiliki izin." };
  }
  const villageId = await resolveVillageId(user);
  const grupId = Number(formData.get("grupId"));
  const kontakId = Number(formData.get("kontakId"));

  try {
    const [kontakRows, grupRows] = await Promise.all([
      listKontak(villageId),
      listKontakGrup(villageId),
    ]);
    if (!kontakRows.some((row) => row.id === kontakId)) {
      return { ok: false, message: "Kontak tidak ditemukan." };
    }
    if (!grupRows.some((row) => row.id === grupId)) {
      return { ok: false, message: "Grup tidak ditemukan." };
    }
    await addAnggotaGrup({ villageId, grupId, kontakId });
    revalidatePath("/hubung-warga/grup-kontak");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Gagal menambah anggota." };
  }
}

export async function removeAnggotaGrupAction(id: number) {
  const user = await verifySession();
  if (!hasPermission(user.permissions, GRUP_KONTAK_RESOURCE, "delete")) {
    return { ok: false, message: "Tidak memiliki izin." };
  }
  const villageId = await resolveVillageId(user);
  try {
    await removeAnggotaGrup(id, villageId);
    revalidatePath("/hubung-warga/grup-kontak");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Gagal menghapus anggota." };
  }
}

/**
 * Impor kontak dari berkas CSV/XLSX.
 *
 * Kolom: Nama (wajib), Telepon, Email, Telegram, Hubung Warga, Keterangan, NIK / ID Penduduk (opsional).
 * NIK atau residentId digunakan untuk penautan ke penduduk (fuzzy match jika NIK).
 */
export async function imporKontakAction(
  _prev: ActionState<null>,
  formData: FormData,
): Promise<ActionState<null>> {
  const user = await verifySession();
  if (!hasPermission(user.permissions, KONTAK_RESOURCE, "update")) {
    return errorState("Tidak memiliki izin mengimpor kontak.");
  }

  const berkas = formData.get("berkas");
  const hasil = await bacaImporDariFormData<KunciImporKontak>(berkas, KOLOM_IMPOR_KONTAK);

  if (!hasil.ok) {
    return errorState(hasil.pesan);
  }
  if (hasil.hasil.baris.length === 0) {
    const pesan = hasil.hasil.galat[0]?.pesan ?? "Tidak ada baris data pada berkas.";
    return errorState(pesan);
  }

  const villageId = await resolveVillageId(user);

  let ditambahkan = 0;
  let dilewati = 0;

  for (const baris of hasil.hasil.baris) {
    const { residentId, ...input } = baris.nilai as unknown as BarisImporKontak;
    try {
      await createKontak({
        villageId,
        nama: input.nama,
        telepon: input.telepon || null,
        email: input.email || null,
        telegram: input.telegram || null,
        hubungWarga: input.hubungWarga || "Telegram",
        keterangan: input.keterangan || null,
      });
      ditambahkan += 1;
    } catch {
      dilewati += 1;
    }
  }

  revalidatePath("/hubung-warga/daftar-kontak");
  const bagian = [`${ditambahkan} ditambahkan`, `${dilewati} dilewati`];
  return successState(`Impor selesai: ${bagian.join("; ")}.`);
}
