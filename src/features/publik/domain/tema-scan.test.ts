import { describe, expect, it } from "vitest";

import { pindaiManifestTema } from "./tema-scan";
import { THEME_SLOTS, type ThemeManifest } from "./theme";

const VALID: ThemeManifest = {
  slug: "esensi",
  nama: "Esensi",
  versi: "1.0.0",
  deskripsi: "Tema bersih",
  warnaPratinjau: "#1a7f4b",
  slot: [...THEME_SLOTS],
  tataLetak: "polos",
};

describe("pindaiManifestTema", () => {
  it("menerima manifest lengkap", () => {
    const hasil = pindaiManifestTema(VALID);
    expect(hasil.valid).toBe(true);
    expect(hasil.masalah).toEqual([]);
  });

  it("menolak slug yang tidak sesuai pola", () => {
    const hasil = pindaiManifestTema({ ...VALID, slug: "Tema Baru!" });
    expect(hasil.valid).toBe(false);
    expect(hasil.masalah).toContain("Slug tema hanya boleh huruf kecil, angka, dan tanda hubung.");
  });

  it("menolak versi yang bukan semver", () => {
    const hasil = pindaiManifestTema({ ...VALID, versi: "v1" });
    expect(hasil.valid).toBe(false);
    expect(hasil.masalah.some((item) => item.startsWith("Versi tema"))).toBe(true);
  });

  it("melaporkan slot yang belum tersedia", () => {
    const hasil = pindaiManifestTema({
      ...VALID,
      slot: THEME_SLOTS.filter((item) => item !== "home"),
    });
    expect(hasil.valid).toBe(false);
    expect(hasil.masalah).toContain("Slot belum tersedia: home.");
  });

  it("melaporkan slot ganda dan tidak dikenal sekali saja", () => {
    const hasil = pindaiManifestTema({
      ...VALID,
      slot: [...THEME_SLOTS, ...THEME_SLOTS, "tidak-ada" as never, "tidak-ada" as never],
    });
    expect(hasil.masalah.join(" ")).toContain("Slot ganda:");
    expect(hasil.masalah.join(" ")).toContain("Slot tidak dikenal: tidak-ada.");
    expect(hasil.masalah.filter((item) => item.includes("tidak-ada")).join(" ")).not.toContain(
      "tidak-ada, tidak-ada",
    );
  });

  it("menolak nama kosong", () => {
    const hasil = pindaiManifestTema({ ...VALID, nama: "   " });
    expect(hasil.valid).toBe(false);
  });
});
