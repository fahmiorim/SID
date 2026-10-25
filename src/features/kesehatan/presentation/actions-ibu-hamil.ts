"use server";

import { revalidatePath } from "next/cache";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { ibuHamilSchema, KIA_RESOURCE } from "@/features/kesehatan/domain/kesehatan";
import {
  createIbuHamil,
  deleteIbuHamil,
  updateIbuHamil,
} from "@/features/kesehatan/infrastructure/kesehatan-repository";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export async function saveIbuHamilAction(formData: FormData) {
  const user = await verifySession();
  if (!hasPermission(user.permissions, KIA_RESOURCE, "update")) {
    return { ok: false, message: "Tidak memiliki izin." };
  }
  const villageId = await resolveVillageId(user);

  const raw = {
    id: formData.get("id") ? Number(formData.get("id")) : undefined,
    villageId,
    posyanduId: Number(formData.get("posyanduId")),
    kiaId: Number(formData.get("kiaId")),
    statusKehamilan: formData.get("statusKehamilan")
      ? Number(formData.get("statusKehamilan"))
      : null,
    usiaKehamilan: formData.get("usiaKehamilan") ? Number(formData.get("usiaKehamilan")) : null,
    tanggalMelahirkan: formData.get("tanggalMelahirkan")
      ? String(formData.get("tanggalMelahirkan"))
      : "",
    pemeriksaanKehamilan: formData.get("pemeriksaanKehamilan") === "on",
    konsumsiPilFe: formData.get("konsumsiPilFe") === "on",
    butirPilFe: formData.get("butirPilFe") ? Number(formData.get("butirPilFe")) : null,
    pemeriksaanNifas: formData.get("pemeriksaanNifas") === "on",
    konselingGizi: formData.get("konselingGizi") === "on",
    kunjunganRumah: formData.get("kunjunganRumah") === "on",
    aksesAirBersih: formData.get("aksesAirBersih") === "on",
    kepemilikanJamban: formData.get("kepemilikanJamban") === "on",
    jaminanKesehatan: formData.get("jaminanKesehatan") === "on",
  };

  const parsed = ibuHamilSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  try {
    const payload = {
      villageId,
      posyanduId: parsed.data.posyanduId,
      kiaId: parsed.data.kiaId,
      statusKehamilan: parsed.data.statusKehamilan ?? null,
      usiaKehamilan: parsed.data.usiaKehamilan ?? null,
      tanggalMelahirkan: parsed.data.tanggalMelahirkan || null,
      pemeriksaanKehamilan: parsed.data.pemeriksaanKehamilan ?? false,
      konsumsiPilFe: parsed.data.konsumsiPilFe ?? false,
      butirPilFe: parsed.data.butirPilFe ?? null,
      pemeriksaanNifas: parsed.data.pemeriksaanNifas ?? false,
      konselingGizi: parsed.data.konselingGizi ?? false,
      kunjunganRumah: parsed.data.kunjunganRumah ?? false,
      aksesAirBersih: parsed.data.aksesAirBersih ?? false,
      kepemilikanJamban: parsed.data.kepemilikanJamban ?? false,
      jaminanKesehatan: parsed.data.jaminanKesehatan ?? false,
    };

    if (parsed.data.id) {
      await updateIbuHamil(parsed.data.id, villageId, payload);
    } else {
      await createIbuHamil(payload);
    }
    revalidatePath("/kesehatan/pemantauan-ibu-hamil");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Gagal menyimpan pemantauan ibu hamil.",
    };
  }
}

export async function deleteIbuHamilAction(id: number) {
  const user = await verifySession();
  if (!hasPermission(user.permissions, KIA_RESOURCE, "delete")) {
    return { ok: false, message: "Tidak memiliki izin." };
  }
  const villageId = await resolveVillageId(user);
  try {
    await deleteIbuHamil(id, villageId);
    revalidatePath("/kesehatan/pemantauan-ibu-hamil");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Gagal menghapus pemantauan ibu hamil.",
    };
  }
}
