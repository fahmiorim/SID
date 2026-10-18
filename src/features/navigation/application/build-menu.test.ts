import { describe, expect, it } from "vitest";

import { buildMenu } from "@/features/navigation/application/build-menu";
import type { ModuleRecord } from "@/features/rbac/infrastructure/rbac-repository";

function mod(overrides: Partial<ModuleRecord> & Pick<ModuleRecord, "id" | "slug">): ModuleRecord {
  return {
    parentId: null,
    name: overrides.slug,
    url: `/${overrides.slug}`,
    icon: null,
    sortOrder: 0,
    isGroup: false,
    isHidden: false,
    isActive: true,
    ...overrides,
  };
}

/** Ambil slug secara berurutan agar assertion tetap ringkas & aman tipe. */
function slugs(items: readonly { slug: string }[]): string[] {
  return items.map((item) => item.slug);
}

describe("buildMenu", () => {
  const modules: readonly ModuleRecord[] = [
    mod({ id: 1, slug: "beranda", sortOrder: 1 }),
    mod({ id: 2, slug: "kependudukan", url: null, isGroup: true, sortOrder: 2 }),
    mod({ id: 3, slug: "penduduk", parentId: 2, sortOrder: 1, name: "Data Penduduk" }),
    mod({ id: 4, slug: "keluarga", parentId: 2, sortOrder: 2, name: "Kartu Keluarga" }),
  ];

  it("menyusun anak di bawah induknya, terurut sortOrder", () => {
    const allowed = new Set(["beranda", "kependudukan", "penduduk", "keluarga"]);
    const menu = buildMenu(modules, allowed);

    expect(slugs(menu)).toEqual(["beranda", "kependudukan"]);
    expect(slugs(menu[1]?.children ?? [])).toEqual(["penduduk", "keluarga"]);
  });

  it("hanya menyertakan modul yang diizinkan", () => {
    const menu = buildMenu(modules, new Set(["penduduk"]));

    // "kependudukan" tidak diizinkan, sehingga "penduduk" naik jadi akar.
    expect(slugs(menu)).toEqual(["penduduk"]);
  });

  it("menyembunyikan modul nonaktif dan tersembunyi", () => {
    const withHidden = [...modules, mod({ id: 5, slug: "log", isHidden: true })];
    const withInactive = [...modules, mod({ id: 6, slug: "arsip", isActive: false })];
    const allowed = new Set(["beranda", "kependudukan", "penduduk", "keluarga", "log", "arsip"]);

    expect(slugs(buildMenu(withHidden, allowed))).not.toContain("log");
    expect(slugs(buildMenu(withInactive, allowed))).not.toContain("arsip");
  });

  it("membuang grup kosong (tanpa url & tanpa anak)", () => {
    const allowed = new Set(["beranda", "kependudukan"]);
    const menu = buildMenu(modules, allowed);

    // "kependudukan" tidak punya anak yang diizinkan dan tidak punya url.
    expect(slugs(menu)).toEqual(["beranda"]);
  });

  it("mengurutkan berdasarkan label bila sortOrder sama", () => {
    const items: readonly ModuleRecord[] = [
      mod({ id: 1, slug: "wilayah", name: "Wilayah", sortOrder: 5 }),
      mod({ id: 2, slug: "penduduk", name: "Penduduk", sortOrder: 5 }),
    ];
    const menu = buildMenu(items, new Set(["wilayah", "penduduk"]));

    expect(slugs(menu)).toEqual(["penduduk", "wilayah"]);
  });
});
