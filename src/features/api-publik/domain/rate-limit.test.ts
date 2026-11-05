import { beforeEach, describe, expect, it } from "vitest";

import { batasiPermintaan, resetBatasPermintaan } from "./rate-limit";

describe("batasiPermintaan", () => {
  beforeEach(() => resetBatasPermintaan());

  it("mengizinkan permintaan selama kuota tersedia", () => {
    const hasil = batasiPermintaan("a", { batas: 2, sekarang: 1_000 });
    expect(hasil.dibatasi).toBe(false);
    expect(hasil.sisa).toBe(1);
  });

  it("menolak permintaan setelah batas tercapai", () => {
    batasiPermintaan("b", { batas: 2, sekarang: 1_000 });
    batasiPermintaan("b", { batas: 2, sekarang: 1_100 });
    const ketiga = batasiPermintaan("b", { batas: 2, sekarang: 1_200 });

    expect(ketiga.dibatasi).toBe(true);
    expect(ketiga.sisa).toBe(0);
  });

  it("memisahkan kuota per kunci", () => {
    batasiPermintaan("c", { batas: 1, sekarang: 1_000 });
    expect(batasiPermintaan("c", { batas: 1, sekarang: 1_100 }).dibatasi).toBe(true);
    expect(batasiPermintaan("d", { batas: 1, sekarang: 1_100 }).dibatasi).toBe(false);
  });

  it("mengizinkan lagi setelah jendela bergulir", () => {
    batasiPermintaan("e", { batas: 1, jendelaMs: 60_000, sekarang: 1_000 });
    expect(batasiPermintaan("e", { batas: 1, jendelaMs: 60_000, sekarang: 30_000 }).dibatasi).toBe(
      true,
    );
    expect(batasiPermintaan("e", { batas: 1, jendelaMs: 60_000, sekarang: 62_000 }).dibatasi).toBe(
      false,
    );
  });
});
