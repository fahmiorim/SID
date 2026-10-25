"use server";

import { revalidatePath } from "next/cache";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { KIA_RESOURCE, posyanduSchema } from "@/features/kesehatan/domain/kesehatan";
import {
  createPosyandu,
  deletePosyandu,
  updatePosyandu,
} from "@/features/kesehatan/infrastructure/kesehatan-repository";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export async function savePosyanduAction(formData: FormData) {
  const user = await verifySession();
  if (!hasPermission(user.permissions, KIA_RESOURCE, "update")) {
    return { ok: false, message: "Tidak memiliki izin." };
  }
  const villageId = await resolveVillageId(user);

  const raw = {
    id: formData.get("id") ? Number(formData.get("id")) : undefined,
    villageId,
    nama: String(formData.get("nama") ?? "").trim(),
    alamat: formData.get("alamat") ? String(formData.get("alamat")) : "",
    namaKetua: formData.get("namaKetua") ? String(formData.get("namaKetua")) : "",
    namaBidan: formData.get("namaBidan") ? String(formData.get("namaBidan")) : "",
  };

  const parsed = posyanduSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  try {
    if (parsed.data.id) {
      await updatePosyandu(parsed.data.id, villageId, {
        nama: parsed.data.nama,
        alamat: parsed.data.alamat || undefined,
        namaKetua: parsed.data.namaKetua || undefined,
        namaBidan: parsed.data.namaBidan || undefined,
      });
    } else {
      await createPosyandu({
        villageId,
        nama: parsed.data.nama,
        alamat: parsed.data.alamat || undefined,
        namaKetua: parsed.data.namaKetua || undefined,
        namaBidan: parsed.data.namaBidan || undefined,
      });
    }
    revalidatePath("/kesehatan/posyandu");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Gagal menyimpan posyandu." };
  }
}

export async function deletePosyanduAction(id: number) {
  const user = await verifySession();
  if (!hasPermission(user.permissions, KIA_RESOURCE, "delete")) {
    return { ok: false, message: "Tidak memiliki izin." };
  }
  const villageId = await resolveVillageId(user);
  try {
    await deletePosyandu(id, villageId);
    revalidatePath("/kesehatan/posyandu");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Gagal menghapus posyandu." };
  }
}
