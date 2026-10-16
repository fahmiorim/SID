/** Aksi granular yang dapat dimiliki atas sebuah resource (modul). */
export type Action = "read" | "update" | "delete";

/** Kode akses legacy OpenSID. */
export const LEGACY_AKSES = {
  NONE: 0,
  READ: 1,
  READ_UPDATE: 3,
  READ_UPDATE_DELETE: 7,
} as const;

export type LegacyAkses = (typeof LEGACY_AKSES)[keyof typeof LEGACY_AKSES];

/**
 * Konversi kode akses legacy (0/1/3/7) menjadi himpunan aksi.
 *
 * Pemetaan dipertahankan sama persis dengan OpenSID:
 * 1 → baca; 3 → baca+ubah; 7 → baca+ubah+hapus.
 */
export function aksesToActions(akses: number | null | undefined): Action[] {
  const value = akses ?? 0;
  const actions: Action[] = [];

  if (value >= LEGACY_AKSES.READ) actions.push("read");
  if (value >= LEGACY_AKSES.READ_UPDATE) actions.push("update");
  if (value >= LEGACY_AKSES.READ_UPDATE_DELETE) actions.push("delete");

  return actions;
}

/** Kode akses legacy dari himpunan aksi (kebalikan `aksesToActions`). */
export function actionsToAkses(actions: readonly Action[]): LegacyAkses {
  const set = new Set(actions);
  if (set.has("delete")) return LEGACY_AKSES.READ_UPDATE_DELETE;
  if (set.has("update")) return LEGACY_AKSES.READ_UPDATE;
  if (set.has("read")) return LEGACY_AKSES.READ;
  return LEGACY_AKSES.NONE;
}

/**
 * Hitung akses efektif untuk sekumpulan modul dengan menerapkan **warisan
 * parent → child** persis seperti OpenSID: bila sebuah modul induk memiliki
 * minimal satu anak dengan akses > 0, maka induk dipaksa menjadi 7.
 *
 * @param modules daftar modul (id, parent, slug)
 * @param aksesById peta id modul → kode akses yang diberikan
 * @returns peta slug modul → kode akses efektif
 */
export function applyParentInheritance(
  modules: readonly { id: number; parent: number | null; slug: string }[],
  aksesById: ReadonlyMap<number, number>,
): Map<string, LegacyAkses> {
  const childrenByParent = new Map<number, number[]>();

  for (const modul of modules) {
    const parentId = modul.parent ?? 0;
    if (parentId > 0) {
      const siblings = childrenByParent.get(parentId) ?? [];
      siblings.push(modul.id);
      childrenByParent.set(parentId, siblings);
    }
  }

  const result = new Map<string, LegacyAkses>();

  for (const modul of modules) {
    const own = (aksesById.get(modul.id) ?? 0) as LegacyAkses;
    const children = childrenByParent.get(modul.id) ?? [];
    const hasActiveChild = children.some((childId) => (aksesById.get(childId) ?? 0) > 0);

    result.set(modul.slug, hasActiveChild ? LEGACY_AKSES.READ_UPDATE_DELETE : own);
  }

  return result;
}
