"use server";

import { revalidatePath } from "next/cache";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { bulananAnakSchema, KIA_RESOURCE } from "@/features/kesehatan/domain/kesehatan";
import {
  createBulananAnak,
  deleteBulananAnak,
  updateBulananAnak,
} from "@/features/kesehatan/infrastructure/kesehatan-repository";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export async function saveBulananAnakAction(formData: FormData) {
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
    statusGizi: Number(formData.get("statusGizi")),
    umurBulan: Number(formData.get("umurBulan")),
    statusTikar: Number(formData.get("statusTikar")),
    pemberianImunisasiDasar: formData.get("pemberianImunisasiDasar") === "on",
    pemberianImunisasiCampak: formData.get("pemberianImunisasiCampak") === "on",
    pengukuranBeratBadan: formData.get("pengukuranBeratBadan") === "on",
    beratBadan: formData.get("beratBadan") ? Number(formData.get("beratBadan")) : null,
    pengukuranTinggiBadan: formData.get("pengukuranTinggiBadan") === "on",
    tinggiBadan: formData.get("tinggiBadan") ? Number(formData.get("tinggiBadan")) : null,
    konselingGiziAyah: formData.get("konselingGiziAyah") === "on",
    konselingGiziIbu: formData.get("konselingGiziIbu") === "on",
    kunjunganRumah: formData.get("kunjunganRumah") === "on",
    airBersih: formData.get("airBersih") === "on",
    kepemilikanJamban: formData.get("kepemilikanJamban") === "on",
    aktaLahir: formData.get("aktaLahir") === "on",
    jaminanKesehatan: formData.get("jaminanKesehatan") === "on",
    pengasuhanPaud: formData.get("pengasuhanPaud") === "on",
  };

  const parsed = bulananAnakSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  try {
    const payload = {
      villageId,
      posyanduId: parsed.data.posyanduId,
      kiaId: parsed.data.kiaId,
      statusGizi: parsed.data.statusGizi,
      umurBulan: parsed.data.umurBulan,
      statusTikar: parsed.data.statusTikar,
      pemberianImunisasiDasar: parsed.data.pemberianImunisasiDasar ?? false,
      pemberianImunisasiCampak: parsed.data.pemberianImunisasiCampak ?? null,
      pengukuranBeratBadan: parsed.data.pengukuranBeratBadan ?? false,
      beratBadan: parsed.data.beratBadan ?? null,
      pengukuranTinggiBadan: parsed.data.pengukuranTinggiBadan ?? false,
      tinggiBadan: parsed.data.tinggiBadan ?? null,
      konselingGiziAyah: parsed.data.konselingGiziAyah ?? false,
      konselingGiziIbu: parsed.data.konselingGiziIbu ?? false,
      kunjunganRumah: parsed.data.kunjunganRumah ?? false,
      airBersih: parsed.data.airBersih ?? false,
      kepemilikanJamban: parsed.data.kepemilikanJamban ?? false,
      aktaLahir: parsed.data.aktaLahir ?? false,
      jaminanKesehatan: parsed.data.jaminanKesehatan ?? false,
      pengasuhanPaud: parsed.data.pengasuhanPaud ?? false,
    };

    if (parsed.data.id) {
      await updateBulananAnak(parsed.data.id, villageId, payload);
    } else {
      await createBulananAnak(payload);
    }
    revalidatePath("/kesehatan/pemantauan-anak");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Gagal menyimpan pemantauan anak.",
    };
  }
}

export async function deleteBulananAnakAction(id: number) {
  const user = await verifySession();
  if (!hasPermission(user.permissions, KIA_RESOURCE, "delete")) {
    return { ok: false, message: "Tidak memiliki izin." };
  }
  const villageId = await resolveVillageId(user);
  try {
    await deleteBulananAnak(id, villageId);
    revalidatePath("/kesehatan/pemantauan-anak");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Gagal menghapus pemantauan anak.",
    };
  }
}
