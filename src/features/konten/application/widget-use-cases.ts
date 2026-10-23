import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  WIDGET_RESOURCE,
  type WidgetFormInput,
  type WidgetRow,
} from "@/features/konten/domain/widget";
import {
  createWidget,
  deleteWidget as deleteWidgetRepo,
  listWidget,
  updateWidget as updateWidgetRepo,
} from "@/features/publik/infrastructure/content-repository";
import { requirePermission } from "@/lib/dal";
import { notFound } from "@/lib/errors";
import { sanitasiHtml } from "@/lib/sanitize";

/** Daftar seluruh widget desa, termasuk yang nonaktif, untuk halaman admin. */
export async function daftarWidgetAdmin(): Promise<WidgetRow[]> {
  const user = await requirePermission(WIDGET_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  return listWidget(villageId, true);
}

/** Simpan widget baru atau ubah widget yang sudah ada. */
export async function simpanWidget(input: WidgetFormInput, id?: number): Promise<void> {
  const user = await requirePermission(WIDGET_RESOURCE, "update");
  const villageId = await resolveVillageId(user);
  const rows = await listWidget(villageId, true);

  if (id !== undefined && !rows.some((row) => row.id === id)) {
    throw notFound("Widget yang akan diubah tidak ditemukan.");
  }

  const data = {
    judul: input.judul || null,
    // Widget teks dirender sebagai HTML di beranda; bersihkan sekali lagi saat
    // simpan. `KontenHtml` tetap melakukan sanitasi lapisan kedua saat render.
    isi: input.isi ? sanitasiHtml(input.isi) : null,
    jenis: input.jenis,
    pengaturan: input.pengaturan || null,
    urut: input.urut,
    aktif: input.aktif,
  };

  if (id === undefined) {
    await createWidget(villageId, data);
    return;
  }

  await updateWidgetRepo(villageId, id, data);
}

export async function hapusWidget(id: number): Promise<void> {
  const user = await requirePermission(WIDGET_RESOURCE, "delete");
  const villageId = await resolveVillageId(user);
  const rows = await listWidget(villageId, true);

  if (!rows.some((row) => row.id === id)) {
    throw notFound("Widget yang akan dihapus tidak ditemukan.");
  }

  await deleteWidgetRepo(villageId, id);
}
