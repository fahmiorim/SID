import { describe, expect, it } from "vitest";

import { opsiKeForm, pengaturanTemaSchema } from "./tema";
import { THEME_DEFAULT_OPTIONS } from "./theme";

const FORM_DASAR = {
  warnaPrimer: "#1a7f4b",
  warnaSekunder: "#0f5132",
  font: "system",
  kelengkungan: "0.75",
  heroJudul: "",
  heroTombol: "",
  heroTombolUrl: "",
  headerVarian: "terang",
  beranda: ["hero", "berita"],
  tampilMenu: true,
  tampilKontakFooter: true,
  teksBerjalan: "  Info desa  ",
  sosmed: [{ platform: "instagram", url: "https://instagram.com/desa" }],
};

describe("pengaturanTemaSchema", () => {
  it("menerima teks berjalan dan tautan sosial media", () => {
    const hasil = pengaturanTemaSchema.parse(FORM_DASAR);
    expect(hasil.teksBerjalan).toBe("Info desa");
    expect(hasil.sosmed).toEqual([{ platform: "instagram", url: "https://instagram.com/desa" }]);
  });

  it("menolak tautan sosial media yang bukan http/https", () => {
    const hasil = pengaturanTemaSchema.safeParse({
      ...FORM_DASAR,
      sosmed: [{ platform: "facebook", url: "javascript:alert(1)" }],
    });
    expect(hasil.success).toBe(false);
  });

  it("membatasi teks berjalan maksimal 240 karakter", () => {
    const hasil = pengaturanTemaSchema.safeParse({
      ...FORM_DASAR,
      teksBerjalan: "a".repeat(241),
    });
    expect(hasil.success).toBe(false);
  });
});

describe("opsiKeForm", () => {
  it("menyalin teks berjalan dan sosial media ke nilai form", () => {
    const sosmed = [{ platform: "youtube" as const, url: "https://youtube.com/@desa" }];
    const nilai = opsiKeForm({
      ...THEME_DEFAULT_OPTIONS,
      teksBerjalan: "Selamat datang",
      sosmed,
    });

    expect(nilai.teksBerjalan).toBe("Selamat datang");
    expect(nilai.sosmed).toEqual(sosmed);
    expect(nilai.sosmed).not.toBe(sosmed);
  });
});
