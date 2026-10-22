import { describe, expect, it } from "vitest";

import { buildTriwulanRows, totalTriwulan } from "./laporan-triwulan";

const dasar = {
  uraian: "Bidang Penyelenggaraan Pemerintahan Desa",
  anggaran: "100000000.00",
};

describe("buildTriwulanRows", () => {
  it("menjumlahkan realisasi dari nilai triwulan yang tersimpan", () => {
    const [row] = buildTriwulanRows([
      { ...dasar, kode: "5.1", tw1: "1000.00", tw2: "2000.00", tw3: "3000.00", tw4: "4000.00" },
    ]);

    expect(row?.realisasi).toBe("10000.00");
    expect(row?.selisih).toBe("99990000.00");
    expect(row?.persen).toBe(0.01);
  });

  it("tidak mengestimasi triwulan dari realisasi tahunan", () => {
    const [row] = buildTriwulanRows([
      { ...dasar, kode: "5.1", tw1: "0.00", tw2: "0.00", tw3: "0.00", tw4: "0.00" },
    ]);

    expect(row?.realisasi).toBe("0.00");
    expect(row?.persen).toBe(0);
  });

  it("memakai nilai triwulan negatif apa adanya", () => {
    const [row] = buildTriwulanRows([
      { ...dasar, kode: "5.1", tw1: "500.00", tw2: "-200.00", tw3: "0.00", tw4: "0.00" },
    ]);

    expect(row?.realisasi).toBe("300.00");
  });
});

describe("totalTriwulan", () => {
  it("menjumlahkan seluruh bidang dan menghitung persentase terhadap total pagu", () => {
    const rows = buildTriwulanRows([
      {
        kode: "5.1",
        uraian: "Pemerintahan",
        anggaran: "1000.00",
        tw1: "100.00",
        tw2: "100.00",
        tw3: "100.00",
        tw4: "100.00",
      },
      {
        kode: "5.2",
        uraian: "Pembangunan",
        anggaran: "3000.00",
        tw1: "500.00",
        tw2: "0.00",
        tw3: "0.00",
        tw4: "0.00",
      },
    ]);

    const total = totalTriwulan(rows);

    expect(total.anggaran).toBe("4000.00");
    expect(total.tw1).toBe("600.00");
    expect(total.realisasi).toBe("900.00");
    expect(total.persen).toBe(22.5);
  });

  it("mengembalikan nol saat belum ada bidang", () => {
    const total = totalTriwulan([]);

    expect(total.anggaran).toBe("0.00");
    expect(total.realisasi).toBe("0.00");
    expect(total.persen).toBe(0);
  });
});
