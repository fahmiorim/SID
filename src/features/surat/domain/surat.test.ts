import { describe, expect, it } from "vitest";

import {
  addMonthsIso,
  buildSuratNumber,
  bulanRomawi,
  formatTanggalIndonesia,
  jenisSuratFormSchema,
  renderSuratTemplate,
  suratFormSchema,
} from "./surat";

describe("buildSuratNumber", () => {
  const context = {
    sequence: 7,
    kodeSurat: "S-41",
    kodeDesa: "3201012001",
    year: 2026,
    month: 10,
  };

  it("mengisi nomor dengan padding tiga digit", () => {
    expect(buildSuratNumber("[kode_surat]/[nomor]/[kode_desa]/[tahun]", context)).toBe(
      "S-41/007/3201012001/2026",
    );
  });

  it("mendukung padding kustom dan bulan romawi", () => {
    expect(buildSuratNumber("[nomor, 5]/[bulan_romawi]/[tahun]", context)).toBe("00007/X/2026");
  });

  it("membiarkan placeholder yang tidak dikenal", () => {
    expect(buildSuratNumber("[tidak_ada]/[nomor]", context)).toBe("[tidak_ada]/007");
  });
});

describe("renderSuratTemplate", () => {
  it("mengganti placeholder tanpa peka huruf besar/kecil", () => {
    const result = renderSuratTemplate("Halo [Nama], NIK [nik].", {
      nama: "Siti",
      nik: "3201012001120001",
    });

    expect(result).toBe("Halo Siti, NIK 3201012001120001.");
  });

  it("membiarkan placeholder yang belum punya nilai", () => {
    expect(renderSuratTemplate("[nama] - [agama]", { nama: "Budi" })).toBe("Budi - [agama]");
  });
});

describe("tanggal & masa berlaku", () => {
  it("memformat tanggal Indonesia tanpa nol di depan", () => {
    expect(formatTanggalIndonesia("2026-10-05")).toBe("5 Oktober 2026");
    expect(formatTanggalIndonesia(null)).toBe("-");
    expect(formatTanggalIndonesia("bukan-tanggal")).toBe("bukan-tanggal");
  });

  it("menjepit tanggal ke akhir bulan tujuan", () => {
    expect(addMonthsIso("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonthsIso("2028-01-31", 1)).toBe("2028-02-29");
    expect(addMonthsIso("2026-12-31", 2)).toBe("2027-02-28");
    expect(addMonthsIso("2026-10-05", 6)).toBe("2027-04-05");
    expect(addMonthsIso("2026-10-05", 0)).toBe("2026-10-05");
  });

  it("menghasilkan angka romawi bulan", () => {
    expect(bulanRomawi(1)).toBe("I");
    expect(bulanRomawi(10)).toBe("X");
    expect(bulanRomawi(12)).toBe("XII");
  });
});

describe("skema formulir surat", () => {
  it("menerima konsep surat yang valid", () => {
    const parsed = suratFormSchema.parse({
      typeId: "3",
      residentId: "none",
      letterDate: "2026-10-05",
      purpose: "SKCK",
    });

    expect(parsed.typeId).toBe(3);
    expect(parsed.residentId).toBeNull();
    expect(parsed.purpose).toBe("SKCK");
  });

  it("menolak jenis surat yang belum dipilih", () => {
    const result = suratFormSchema.safeParse({
      typeId: "",
      residentId: "none",
      letterDate: "2026-10-05",
      purpose: "",
    });

    expect(result.success).toBe(false);
  });

  it("menerima jenis surat dengan nilai default format nomor", () => {
    const parsed = jenisSuratFormSchema.parse({
      code: "S-41",
      name: "Domisili",
      classificationId: "none",
      templateBody: "Halo [nama]",
      requiresResident: true,
      isActive: true,
      numberFormat: "",
      validityMonths: "6",
      sortOrder: "1",
    });

    expect(parsed.classificationId).toBeNull();
    expect(parsed.numberFormat).toBe("[kode_surat]/[nomor]/[kode_desa]/[tahun]");
    expect(parsed.validityMonths).toBe(6);
  });
});
