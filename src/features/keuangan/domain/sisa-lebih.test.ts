import { describe, expect, it } from "vitest";

import { sisaLebihFormSchema } from "./sisa-lebih";

function masukanSisaLebih(ubah: Partial<Record<string, unknown>> = {}) {
  return { tahun: 2025, jumlah: "1500000", keterangan: "", tanggal: "", ...ubah };
}

describe("validasi SiLPA", () => {
  it("menerima masukan sah dan mengubah tahun dari teks menjadi angka", () => {
    const hasil = sisaLebihFormSchema.parse(masukanSisaLebih({ tahun: "2025" }));

    expect(hasil.tahun).toBe(2025);
    expect(hasil.jumlah).toBe("1500000");
  });

  it("menormalkan keterangan dan tanggal kosong menjadi null", () => {
    const hasil = sisaLebihFormSchema.parse(masukanSisaLebih());

    expect(hasil.keterangan).toBeNull();
    expect(hasil.tanggal).toBeNull();
  });

  it("mempertahankan keterangan yang diisi", () => {
    const hasil = sisaLebihFormSchema.parse(
      masukanSisaLebih({ keterangan: "Sisa perhitungan 2024", tanggal: "2025-01-10" }),
    );

    expect(hasil.keterangan).toBe("Sisa perhitungan 2024");
    expect(hasil.tanggal).toBe("2025-01-10");
  });

  it.each([1999, 2101, 2025.5])("menolak tahun %s", (tahun) => {
    expect(sisaLebihFormSchema.safeParse(masukanSisaLebih({ tahun })).success).toBe(false);
  });

  it("menolak jumlah kosong", () => {
    expect(sisaLebihFormSchema.safeParse(masukanSisaLebih({ jumlah: "" })).success).toBe(false);
  });

  it("menerima batas tahun 2000 dan 2100", () => {
    expect(sisaLebihFormSchema.safeParse(masukanSisaLebih({ tahun: 2000 })).success).toBe(true);
    expect(sisaLebihFormSchema.safeParse(masukanSisaLebih({ tahun: 2100 })).success).toBe(true);
  });
});
