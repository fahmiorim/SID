/** Pilihan sederhana: id + nama (untuk select formulir). */
export interface IdOption {
  id: number;
  name: string;
}

/** Pilihan dengan label siap tampil (untuk wilayah). */
export interface LabelOption {
  id: number;
  label: string;
}

/** Helper: ambil opsi dari tabel referensi (server-only). */
export async function getReferenceOptions<T extends { id: number; name: string }>(
  repositoryCall: () => Promise<T[]>,
): Promise<IdOption[]> {
  const rows = await repositoryCall();
  return rows.map((r) => ({ id: r.id, name: r.name }));
}

/** Helper: ambil opsi wilayah. */
export async function getRegionOptions(villageId: number): Promise<LabelOption[]> {
  const { listWilayahOptions } =
    await import("@/features/wilayah/infrastructure/wilayah-repository");
  const { formatWilayahLabel } = await import("@/features/wilayah/domain/wilayah");
  const rows = await listWilayahOptions(villageId);
  return rows.map((r) => ({
    id: r.id,
    label: formatWilayahLabel({ dusun: r.dusun, rw: r.rw, rt: r.rt }),
  }));
}

/** Tipe data pilihan untuk client (serialisasi JSON). */
export type ReferenceOption = IdOption;
export type RegionOption = LabelOption;
