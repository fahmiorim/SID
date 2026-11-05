import { describe, expect, it } from "vitest";

import {
  kontrasTeks,
  parseThemeOptions,
  THEME_DEFAULT_OPTIONS,
  themeCssVars,
  themeOptionsSchema,
} from "./theme";

describe("themeOptionsSchema", () => {
  it("mengisi nilai bawaan saat objek kosong", () => {
    const opsi = themeOptionsSchema.parse({});
    expect(opsi.warnaPrimer).toBe("#1a7f4b");
    expect(opsi.font).toBe("system");
    expect(opsi.tampilMenu).toBe(true);
    expect(opsi.teksBerjalan).toBe("");
    expect(opsi.sosmed).toEqual([]);
    expect(opsi.beranda).toEqual([
      "hero",
      "statistik",
      "widget",
      "berita",
      "surat",
      "agenda",
      "kontak",
    ]);
  });

  it("menolak warna yang bukan heks 6 digit", () => {
    const hasil = themeOptionsSchema.safeParse({ warnaPrimer: "biru" });
    expect(hasil.success).toBe(false);
  });

  it("menolak bagian beranda selain yang dikenal", () => {
    const hasil = themeOptionsSchema.safeParse({ beranda: ["hero", "tidak-ada"] });
    expect(hasil.success).toBe(false);
  });

  it("menerima tautan sosial media http/https", () => {
    const opsi = themeOptionsSchema.parse({
      teksBerjalan: "  Selamat datang  ",
      sosmed: [{ platform: "instagram", url: "https://instagram.com/desa" }],
    });
    expect(opsi.teksBerjalan).toBe("Selamat datang");
    expect(opsi.sosmed).toHaveLength(1);
    expect(opsi.sosmed[0]?.platform).toBe("instagram");
  });

  it("menolak tautan sosial media selain http/https", () => {
    const hasil = themeOptionsSchema.safeParse({
      sosmed: [{ platform: "facebook", url: "javascript:alert(1)" }],
    });
    expect(hasil.success).toBe(false);
  });
});

describe("parseThemeOptions", () => {
  it("memakai bawaan untuk nilai null", () => {
    expect(parseThemeOptions(null)).toEqual(THEME_DEFAULT_OPTIONS);
  });

  it("mem-parse string JSON", () => {
    const opsi = parseThemeOptions('{"warnaPrimer":"#123456","font":"serif"}');
    expect(opsi.warnaPrimer).toBe("#123456");
    expect(opsi.font).toBe("serif");
  });

  it("kembali ke bawaan saat JSON rusak", () => {
    expect(parseThemeOptions("{bukan json")).toEqual(THEME_DEFAULT_OPTIONS);
  });

  it("menggabungkan nilai parsial dengan bawaan", () => {
    const opsi = parseThemeOptions({ warnaSekunder: "#000000" });
    expect(opsi.warnaSekunder).toBe("#000000");
    expect(opsi.warnaPrimer).toBe(THEME_DEFAULT_OPTIONS.warnaPrimer);
  });

  it("membuang bagian beranda duplikat", () => {
    const opsi = parseThemeOptions({ beranda: ["hero", "hero", "berita"] });
    expect(opsi.beranda).toEqual(["hero", "berita"]);
  });

  it("memakai susunan bawaan saat daftar beranda kosong", () => {
    const opsi = parseThemeOptions({ beranda: [] });
    expect(opsi.beranda).toEqual(THEME_DEFAULT_OPTIONS.beranda);
  });

  it("membuang entri sosial media tidak valid tanpa menghapus opsi lain", () => {
    const opsi = parseThemeOptions({
      warnaPrimer: "#123456",
      sosmed: [
        { platform: "instagram", url: "https://instagram.com/desa" },
        { platform: "facebook", url: "javascript:alert(1)" },
        { platform: "tidak-ada", url: "https://example.com" },
      ],
    });
    expect(opsi.warnaPrimer).toBe("#123456");
    expect(opsi.sosmed).toEqual([{ platform: "instagram", url: "https://instagram.com/desa" }]);
  });
});

describe("kontrasTeks", () => {
  it("memilih teks gelap pada latar terang", () => {
    expect(kontrasTeks("#ffffff")).toBe("#0b0b0b");
  });

  it("memilih teks terang pada latar gelap", () => {
    expect(kontrasTeks("#000000")).toBe("#ffffff");
  });
});

describe("themeCssVars", () => {
  it("memetakan opsi menjadi variabel CSS", () => {
    const vars = themeCssVars({
      ...THEME_DEFAULT_OPTIONS,
      warnaPrimer: "#000000",
      kelengkungan: 1,
    });
    expect(vars["--pub-primary"]).toBe("#000000");
    expect(vars["--pub-primary-foreground"]).toBe("#ffffff");
    expect(vars["--pub-radius"]).toBe("1rem");
    expect(vars["--pub-font"]).toContain("--font-geist-sans");
  });
});
