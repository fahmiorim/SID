import { describe, expect, it } from "vitest";

import {
  kontrasTeks,
  parseThemeOptions,
  rasioKontras,
  THEME_DEFAULT_OPTIONS,
  themeCssVars,
  themeOptionsSchema,
  warnaTeksAksen,
} from "./theme";

describe("themeOptionsSchema", () => {
  it("mengisi nilai bawaan saat objek kosong", () => {
    const opsi = themeOptionsSchema.parse({});
    expect(opsi.warnaPrimer).toBe("#1a7f4b");
    expect(opsi.font).toBe("aksesibel");
    expect(opsi.tampilMenu).toBe(true);
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

  it("menyediakan teks berjalan kosong dan tanpa sosial media", () => {
    const opsi = themeOptionsSchema.parse({});
    expect(opsi.teksBerjalan).toBe("");
    expect(opsi.sosmed).toEqual([]);
  });

  it("menerima tautan sosial media http/https", () => {
    const opsi = themeOptionsSchema.parse({
      teksBerjalan: "Pelayanan Senin–Jumat",
      sosmed: [{ platform: "facebook", url: "https://facebook.com/desa" }],
    });
    expect(opsi.teksBerjalan).toBe("Pelayanan Senin–Jumat");
    expect(opsi.sosmed).toEqual([{ platform: "facebook", url: "https://facebook.com/desa" }]);
  });

  it("menolak tautan sosial media tanpa skema http", () => {
    const hasil = themeOptionsSchema.safeParse({
      sosmed: [{ platform: "instagram", url: "instagram.com/desa" }],
    });
    expect(hasil.success).toBe(false);
  });

  it("menolak platform sosial media yang tidak dikenal", () => {
    const hasil = themeOptionsSchema.safeParse({
      sosmed: [{ platform: "myspace", url: "https://myspace.com/desa" }],
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

  it("membuang platform sosial media duplikat", () => {
    const opsi = parseThemeOptions({
      sosmed: [
        { platform: "facebook", url: "https://facebook.com/a" },
        { platform: "facebook", url: "https://facebook.com/b" },
        { platform: "youtube", url: "https://youtube.com/@a" },
      ],
    });
    expect(opsi.sosmed).toHaveLength(2);
    expect(opsi.sosmed[0]?.url).toBe("https://facebook.com/a");
  });
});

describe("kontrasTeks", () => {
  it("memilih teks gelap pada latar terang", () => {
    expect(kontrasTeks("#ffffff")).toBe("#0b0b0b");
  });

  it("memilih teks terang pada latar gelap", () => {
    expect(kontrasTeks("#000000")).toBe("#ffffff");
  });

  it("memberi teks gelap pada warna desa rentang tengah", () => {
    expect(kontrasTeks("#16a34a")).toBe("#0b0b0b");
    expect(rasioKontras("#16a34a", "#0b0b0b")).toBeGreaterThanOrEqual(4.5);
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
    expect(vars["--pub-font"]).toContain("--font-atkinson");
  });

  it("menyediakan warna aksen teks yang lolos kontras 4,5:1", () => {
    const vars = themeCssVars({ ...THEME_DEFAULT_OPTIONS, warnaPrimer: "#16a34a" });
    expect(rasioKontras(vars["--pub-primary-text"] ?? "", "#ffffff")).toBeGreaterThanOrEqual(4.5);
    // Warna tombol tetap warna desa apa adanya.
    expect(vars["--pub-primary"]).toBe("#16a34a");
  });

  it("menyediakan teks yang aman di atas permukaan primary-text", () => {
    for (const warnaPrimer of ["#ffd400", "#16a34a", "#0f5132"]) {
      const vars = themeCssVars({ ...THEME_DEFAULT_OPTIONS, warnaPrimer });
      expect(
        rasioKontras(vars["--pub-primary-text"] ?? "", vars["--pub-primary-text-foreground"] ?? ""),
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe("warnaTeksAksen", () => {
  it("membiarkan warna gelap yang sudah aman", () => {
    expect(warnaTeksAksen("#0f5132")).toBe("#0f5132");
  });

  it("menggelapkan warna terang sampai memenuhi ambang teks normal", () => {
    const hasil = warnaTeksAksen("#ffd400");
    expect(hasil).not.toBe("#ffd400");
    expect(rasioKontras(hasil, "#ffffff")).toBeGreaterThanOrEqual(4.5);
  });
});
