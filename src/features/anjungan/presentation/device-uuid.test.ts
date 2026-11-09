import { describe, expect, it } from "vitest";

import {
  ANJUNGAN_UUID_KEY,
  bacaAtauBuatUuidPerangkat,
  normalisasiUuidPerangkat,
} from "./device-uuid";

const UUID_V4 = "550e8400-e29b-41d4-a716-446655440000";
const UUID_V4_BARU = "6ba7b810-9dad-41d1-80b4-00c04fd430c8";

function penyimpananAwal(nilai: string | null) {
  const isi = new Map<string, string>();
  if (nilai !== null) isi.set(ANJUNGAN_UUID_KEY, nilai);
  return {
    isi,
    getItem: (kunci: string) => isi.get(kunci) ?? null,
    setItem: (kunci: string, value: string) => void isi.set(kunci, value),
  };
}

describe("normalisasiUuidPerangkat", () => {
  it("menerima UUID valid dan menolak nilai kosong atau bukan UUID", () => {
    expect(normalisasiUuidPerangkat(UUID_V4)).toBe(UUID_V4);
    expect(normalisasiUuidPerangkat("   ")).toBeNull();
    expect(normalisasiUuidPerangkat(null)).toBeNull();
    expect(normalisasiUuidPerangkat("bukan-uuid")).toBeNull();
  });
});

describe("bacaAtauBuatUuidPerangkat", () => {
  it("memakai UUID tersimpan tanpa membuat yang baru", () => {
    const penyimpanan = penyimpananAwal(UUID_V4);
    let dipanggil = false;

    const hasil = bacaAtauBuatUuidPerangkat(penyimpanan, () => {
      dipanggil = true;
      return UUID_V4_BARU;
    });

    expect(hasil).toEqual({ uuid: UUID_V4, baru: false });
    expect(dipanggil).toBe(false);
  });

  it("membuat dan menyimpan UUID baru bila belum ada", () => {
    const penyimpanan = penyimpananAwal(null);

    const hasil = bacaAtauBuatUuidPerangkat(penyimpanan, () => UUID_V4_BARU);

    expect(hasil).toEqual({ uuid: UUID_V4_BARU, baru: true });
    expect(penyimpanan.getItem(ANJUNGAN_UUID_KEY)).toBe(UUID_V4_BARU);
  });

  it("mengganti UUID tersimpan yang rusak", () => {
    const penyimpanan = penyimpananAwal("rusak");

    const hasil = bacaAtauBuatUuidPerangkat(penyimpanan, () => UUID_V4_BARU);

    expect(hasil).toEqual({ uuid: UUID_V4_BARU, baru: true });
    expect(penyimpanan.getItem(ANJUNGAN_UUID_KEY)).toBe(UUID_V4_BARU);
  });

  it("melempar galat bila pembuat UUID mengembalikan nilai tidak valid", () => {
    const penyimpanan = penyimpananAwal(null);

    expect(() => bacaAtauBuatUuidPerangkat(penyimpanan, () => "rusak")).toThrow(
      "Gagal membuat UUID perangkat.",
    );
    expect(penyimpanan.getItem(ANJUNGAN_UUID_KEY)).toBeNull();
  });
});
