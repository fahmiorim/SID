import { describe, expect, it } from "vitest";

import {
  DOKUMEN_JENIS,
  DOKUMEN_JENIS_LABELS,
  dokumenJenisLabel,
  susunArsipDokumen,
} from "./dokumen";

describe("dokumenJenisLabel", () => {
  it("memberi label untuk jenis baku", () => {
    for (const jenis of DOKUMEN_JENIS) {
      expect(dokumenJenisLabel(jenis)).toBe(DOKUMEN_JENIS_LABELS[jenis]);
    }
  });

  it("mempertahankan jenis lama yang tidak dikenal", () => {
    expect(dokumenJenisLabel("surat_edaran")).toBe("surat_edaran");
  });

  it("memakai label 'Tanpa jenis' untuk nilai kosong", () => {
    expect(dokumenJenisLabel(null)).toBe("Tanpa jenis");
    expect(dokumenJenisLabel("")).toBe("Tanpa jenis");
  });
});

describe("susunArsipDokumen", () => {
  it("mengelompokkan per tahun (terbaru dulu) lalu per jenis", () => {
    const arsip = susunArsipDokumen([
      { tahun: 2025, jenis: "peraturan_desa" },
      { tahun: 2026, jenis: "peraturan_kepala_desa" },
      { tahun: 2026, jenis: "peraturan_desa" },
      { tahun: 2026, jenis: "peraturan_desa" },
    ]);

    expect(arsip.map((item) => item.tahun)).toEqual([2026, 2025]);
    expect(arsip[0]?.jumlah).toBe(3);
    expect(arsip[0]?.jenis).toEqual([
      { jenis: "peraturan_desa", label: "Peraturan Desa", jumlah: 2 },
      { jenis: "peraturan_kepala_desa", label: "Peraturan Kepala Desa", jumlah: 1 },
    ]);
  });

  it("meletakkan dokumen tanpa tahun di akhir", () => {
    const arsip = susunArsipDokumen([
      { tahun: null, jenis: null },
      { tahun: 2024, jenis: "peraturan_desa" },
    ]);
    expect(arsip.map((item) => item.tahun)).toEqual([2024, null]);
    expect(arsip[1]?.jenis[0]).toEqual({ jenis: null, label: "Tanpa jenis", jumlah: 1 });
  });

  it("mengembalikan daftar kosong saat tidak ada dokumen", () => {
    expect(susunArsipDokumen([])).toEqual([]);
  });
});
