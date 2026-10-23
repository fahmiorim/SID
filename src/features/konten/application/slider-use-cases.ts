import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  SLIDER_RESOURCE,
  type SliderFormInput,
  type SliderRow,
} from "@/features/konten/domain/slider";
import {
  createSlider,
  deleteSlider,
  listSlider,
  updateSlider,
} from "@/features/publik/infrastructure/content-repository";
import { requirePermission } from "@/lib/dal";
import { notFound } from "@/lib/errors";

/** Daftar seluruh slider desa, termasuk yang nonaktif, untuk halaman admin. */
export async function daftarSliderAdmin(): Promise<SliderRow[]> {
  const user = await requirePermission(SLIDER_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  return listSlider(villageId, true);
}

/** Simpan slider baru atau ubah slider yang sudah ada. */
export async function simpanSlider(input: SliderFormInput, id?: number): Promise<void> {
  const user = await requirePermission(SLIDER_RESOURCE, "update");
  const villageId = await resolveVillageId(user);
  const rows = await listSlider(villageId, true);

  if (id !== undefined && !rows.some((row) => row.id === id)) {
    throw notFound("Slider yang akan diubah tidak ditemukan.");
  }

  const data = {
    gambar: input.gambar,
    judul: input.judul || null,
    keterangan: input.keterangan || null,
    tautan: input.tautan || null,
    urut: input.urut,
    aktif: input.aktif,
  };

  if (id === undefined) {
    await createSlider(villageId, data);
    return;
  }

  await updateSlider(villageId, id, data);
}

export async function hapusSlider(id: number): Promise<void> {
  const user = await requirePermission(SLIDER_RESOURCE, "delete");
  const villageId = await resolveVillageId(user);
  const rows = await listSlider(villageId, true);

  if (!rows.some((row) => row.id === id)) {
    throw notFound("Slider yang akan dihapus tidak ditemukan.");
  }

  await deleteSlider(villageId, id);
}
