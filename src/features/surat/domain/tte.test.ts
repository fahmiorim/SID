import { describe, expect, it } from "vitest";

import { parseKonfigTte, siapTte, tandaiTte } from "./tte";

const PDF_PALSU = new Uint8Array([0x25, 0x50, 0x44, 0x46]); // "%PDF"

const PERMINTAAN = {
  villageId: 1,
  suratId: 7,
  nomor: "007/SK/10/2026",
  pdf: PDF_PALSU,
};

describe("parseKonfigTte", () => {
  it("tanpa variabel apa pun → mode nonaktif", () => {
    const config = parseKonfigTte({});

    expect(config.mode).toBe("nonaktif");
    expect(config.ssl).toBe(true);
    expect(siapTte(config)).toBe(false);
  });

  it("nilai asing jatuh aman ke nonaktif", () => {
    expect(parseKonfigTte({ TTE_MODE: "muter" }).mode).toBe("nonaktif");
    expect(parseKonfigTte({ TTE_MODE: "BSRE" }).mode).toBe("bsre");
    expect(parseKonfigTte({ TTE_MODE: "MANUAL" }).mode).toBe("manual");
  });

  it("bsre tanpa kredensial lengkap dianggap belum siap", () => {
    const parsial = parseKonfigTte({
      TTE_MODE: "bsre",
      TTE_API: "https://tte.example.go.id",
    });

    expect(siapTte(parsial)).toBe(false);

    const lengkap = parseKonfigTte({
      TTE_MODE: "bsre",
      TTE_API: "https://tte.example.go.id",
      TTE_USERNAME: "desa",
      TTE_PASSWORD: "rahasia",
    });

    expect(siapTte(lengkap)).toBe(true);
  });

  it("TTE_SSL=false mematikan verifikasi TLS", () => {
    expect(parseKonfigTte({ TTE_SSL: "false" }).ssl).toBe(false);
    expect(parseKonfigTte({ TTE_SSL: "TRUE" }).ssl).toBe(true);
  });
});

describe("tandaiTte", () => {
  it("mode nonaktif tidak menyentuh jaringan dan tidak memblokir", async () => {
    const hasil = await tandaiTte(parseKonfigTte({}), PERMINTAAN, null);

    expect(hasil.ok).toBe(false);
    if (!hasil.ok) expect(hasil.alasan).toContain("dinonaktifkan");
  });

  it("mode manual menjelaskan penandai basah", async () => {
    const hasil = await tandaiTte(parseKonfigTte({ TTE_MODE: "manual" }), PERMINTAAN, null);

    expect(hasil.ok).toBe(false);
    if (!hasil.ok) {
      expect(hasil.mode).toBe("manual");
      expect(hasil.alasan).toContain("basah");
    }
  });

  it("bsre siap tapi adapter belum diimplementasi → tidak memblokir", async () => {
    const config = parseKonfigTte({
      TTE_MODE: "bsre",
      TTE_API: "https://tte.example.go.id",
      TTE_USERNAME: "desa",
      TTE_PASSWORD: "rahasia",
    });

    // Klien non-null pun tetap aman: adapter jaringan belum terpasang,
    // hasil tidak ok tanpa melempar error (penerbitan tidak boleh gagal).
    const hasil = await tandaiTte(config, PERMINTAAN, async () => PDF_PALSU);

    expect(hasil.ok).toBe(false);
    if (!hasil.ok) {
      expect(hasil.mode).toBe("bsre");
      expect(hasil.alasan).toContain("belum diimplementasi");
    }
  });
});
