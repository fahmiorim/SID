import { describe, expect, it } from "vitest";

import {
  FILTER_INVENTARIS_KOSONG,
  filterInventarisAktif,
  namaBerkasInventarisPublik,
  parseInventarisFilter,
} from "./inventaris-publik";

describe("parseInventarisFilter", () => {
  it("membaca seluruh filter yang valid", () => {
    expect(
      parseInventarisFilter({
        kategori: "3",
        kondisi: "rusak_ringan",
        lokasi: "  Kantor Desa  ",
        tahun: "2024",
      }),
    ).toEqual({ kategoriId: 3, kondisi: "rusak_ringan", lokasi: "Kantor Desa", tahun: 2024 });
  });

  it("mengabaikan nilai kosong atau tidak valid", () => {
    expect(
      parseInventarisFilter({
        kategori: "abc",
        kondisi: "hilang",
        lokasi: "   ",
        tahun: "1800",
      }),
    ).toEqual(FILTER_INVENTARIS_KOSONG);

    expect(parseInventarisFilter({ kategori: "0", tahun: "2024.5" })).toEqual(
      FILTER_INVENTARIS_KOSONG,
    );
  });

  it("memakai nilai pertama bila parameter berulang dan memotong lokasi", () => {
    const hasil = parseInventarisFilter({
      kategori: ["2", "5"],
      lokasi: "x".repeat(200),
    });

    expect(hasil.kategoriId).toBe(2);
    expect(hasil.lokasi).toHaveLength(150);
  });
});

describe("filterInventarisAktif", () => {
  it("mendeteksi filter kosong dan terisi", () => {
    expect(filterInventarisAktif(FILTER_INVENTARIS_KOSONG)).toBe(false);
    expect(filterInventarisAktif({ ...FILTER_INVENTARIS_KOSONG, kondisi: "baik" })).toBe(true);
  });
});

describe("namaBerkasInventarisPublik", () => {
  it("menyusun nama berkas dari desa, kategori, tahun, dan kondisi", () => {
    expect(
      namaBerkasInventarisPublik(
        "Desa Sukamaju",
        { kategoriId: 1, kondisi: "baik", lokasi: null, tahun: 2024 },
        "Peralatan & Mesin",
      ),
    ).toBe("inventaris-desa-sukamaju-peralatan-mesin-2024-baik.csv");
  });

  it("memakai awalan desa saat nama desa kosong", () => {
    expect(namaBerkasInventarisPublik(null, FILTER_INVENTARIS_KOSONG)).toBe("inventaris-desa.csv");
  });
});
