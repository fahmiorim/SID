/**
 * Model izin RBAC.
 *
 * Sebuah role memiliki **satu tingkat akses** per modul. Tingkat disimpan
 * sebagai nilai bernama (bukan kode bitmask) agar terbaca langsung di basis
 * data maupun kode.
 *
 * - `read`   — hanya melihat
 * - `write`  — melihat, menambah, dan mengubah
 * - `manage` — seluruhnya, termasuk menghapus
 */
export const ACCESS_LEVELS = ["read", "write", "manage"] as const;

export type AccessLevel = (typeof ACCESS_LEVELS)[number];

/** Peringkat tingkat untuk perbandingan (semakin besar semakin luas). */
export const ACCESS_RANK: Readonly<Record<AccessLevel, number>> = {
  read: 1,
  write: 2,
  manage: 3,
};

/** Aksi granular yang dapat dimiliki atas sebuah resource (modul). */
export type Action = "read" | "update" | "delete";

/** Tingkat minimum yang dibutuhkan untuk masing-masing aksi. */
const REQUIRED_LEVEL: Readonly<Record<Action, AccessLevel>> = {
  read: "read",
  update: "write",
  delete: "manage",
};

function rank(level: AccessLevel | null | undefined): number {
  return level ? ACCESS_RANK[level] : 0;
}

/** Apakah `level` cukup untuk melakukan `action`. */
export function levelAllows(level: AccessLevel | null | undefined, action: Action): boolean {
  if (!level) return false;
  return ACCESS_RANK[level] >= ACCESS_RANK[REQUIRED_LEVEL[action]];
}

/** Ubah sebuah tingkat menjadi daftar aksi yang diizinkan. */
export function levelToActions(level: AccessLevel | null | undefined): Action[] {
  if (!level) return [];
  return (["read", "update", "delete"] as const).filter((action) => levelAllows(level, action));
}

/** Tingkat terluas di antara dua nilai (`null` = tidak ada akses). */
function widest(a: AccessLevel | null, b: AccessLevel | null): AccessLevel | null {
  return rank(a) >= rank(b) ? a : b;
}

/** Simpul modul minimal yang dibutuhkan untuk perhitungan warisan. */
export interface ModuleNode {
  id: number;
  parentId: number | null;
  slug: string;
}

/**
 * Terapkan warisan **induk ← anak**: sebuah modul grup (mis. "Kependudukan")
 * harus dapat dibaca bila minimal satu anaknya dapat dibaca, supaya grup menunya
 * ikut tampil.
 *
 * Tingkat anak tidak dinaikkan; hanya tingkat baca pada induk yang ditambahkan,
 * dan tingkat eksplisit induk yang lebih luas tetap dipertahankan.
 *
 * @returns peta slug modul → tingkat efektif (hanya yang punya akses)
 */
export function applyParentInheritance(
  modules: readonly ModuleNode[],
  levelById: ReadonlyMap<number, AccessLevel>,
): Map<string, AccessLevel> {
  const childrenByParent = new Map<number, number[]>();

  for (const modul of modules) {
    const parentId = modul.parentId ?? 0;
    if (parentId > 0) {
      const siblings = childrenByParent.get(parentId) ?? [];
      siblings.push(modul.id);
      childrenByParent.set(parentId, siblings);
    }
  }

  const effective = new Map<string, AccessLevel>();

  for (const modul of modules) {
    const own = levelById.get(modul.id) ?? null;
    const children = childrenByParent.get(modul.id) ?? [];
    const childReadable = children.some((childId) => levelById.has(childId));

    const level = childReadable ? widest(own, "read") : own;
    if (level) effective.set(modul.slug, level);
  }

  return effective;
}
