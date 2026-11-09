"use server";

import { revalidatePath } from "next/cache";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { hapusKia, tambahKia, ubahKia } from "@/features/kesehatan/application/kia-use-cases";
import { KIA_RESOURCE, kiaSchema } from "@/features/kesehatan/domain/kesehatan";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export async function saveKiaAction(formData: FormData) {
  const user = await verifySession();
  if (!hasPermission(user.permissions, KIA_RESOURCE, "update")) {
    return { ok: false, message: "Tidak memiliki izin." };
  }
  const villageId = await resolveVillageId(user);

  const raw = {
    id: formData.get("id") ? Number(formData.get("id")) : undefined,
    villageId,
    noKia: String(formData.get("noKia") ?? "").trim(),
    ibuId: Number(formData.get("ibuId")),
    anakId: formData.get("anakId") ? Number(formData.get("anakId")) : null,
    hariPerkiraanLahir: formData.get("hariPerkiraanLahir")
      ? String(formData.get("hariPerkiraanLahir"))
      : "",
  };

  const parsed = kiaSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  try {
    if (parsed.data.id) {
      await ubahKia(parsed.data.id, villageId, {
        noKia: parsed.data.noKia,
        ibuId: parsed.data.ibuId,
        anakId: parsed.data.anakId ?? null,
        hariPerkiraanLahir: parsed.data.hariPerkiraanLahir || null,
      });
    } else {
      await tambahKia({
        villageId,
        noKia: parsed.data.noKia,
        ibuId: parsed.data.ibuId,
        anakId: parsed.data.anakId ?? null,
        hariPerkiraanLahir: parsed.data.hariPerkiraanLahir || null,
      });
    }
    revalidatePath("/kesehatan/kia");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Gagal menyimpan KIA." };
  }
}

export async function deleteKiaAction(id: number) {
  const user = await verifySession();
  if (!hasPermission(user.permissions, KIA_RESOURCE, "delete")) {
    return { ok: false, message: "Tidak memiliki izin." };
  }
  const villageId = await resolveVillageId(user);
  try {
    await hapusKia(id, villageId);
    revalidatePath("/kesehatan/kia");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Gagal menghapus KIA." };
  }
}
