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
import { verifySession } from "@/lib/dal";

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
