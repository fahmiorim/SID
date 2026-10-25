"use server";

import { revalidatePath } from "next/cache";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { KONTAK_RESOURCE, kontakSchema } from "@/features/kontak/domain/kontak";
import {
  createKontak,
  deleteKontak,
  updateKontak,
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
