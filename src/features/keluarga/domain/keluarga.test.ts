import { describe, expect, it } from "vitest";

import {
  HEAD_OF_FAMILY_RELATION_ID,
  keluargaFormSchema,
  keluargaLabel,
} from "@/features/keluarga/domain/keluarga";
import { NO_SELECTION } from "@/lib/forms";

const minimalInput = {
  number: "3201012001120001",
  address: "",
  regionId: "",
};

describe("keluargaFormSchema", () => {
  it("menerima input valid dan memangkas spasi", () => {
    const result = keluargaFormSchema.parse({
      ...minimalInput,
      number: " 3201012001120001 ",
      address: "  Jl. Melati No. 3 ",
      regionId: "2",
    });

    expect(result.number).toBe("3201012001120001");
    expect(result.address).toBe("Jl. Melati No. 3");
    expect(result.regionId).toBe(2);
  });

  it("mengubah pilihan wilayah kosong menjadi null", () => {
    expect(
      keluargaFormSchema.parse({ ...minimalInput, regionId: NO_SELECTION }).regionId,
    ).toBeNull();
    expect(keluargaFormSchema.parse(minimalInput).regionId).toBeNull();
  });

  it("menerima nomor KK tanpa wilayah", () => {
    const result = keluargaFormSchema.parse(minimalInput);

    expect(result.number).toBe("3201012001120001");
    expect(result.address).toBe("");
  });

  it("menolak nomor KK yang kosong atau bukan 16 angka", () => {
    expect(keluargaFormSchema.safeParse({ ...minimalInput, number: "" }).success).toBe(false);
    expect(keluargaFormSchema.safeParse({ ...minimalInput, number: "123" }).success).toBe(false);
    expect(
      keluargaFormSchema.safeParse({ ...minimalInput, number: "32010120011200AB" }).success,
    ).toBe(false);
  });

  it("menolak alamat yang terlalu panjang", () => {
    expect(
      keluargaFormSchema.safeParse({ ...minimalInput, address: "a".repeat(256) }).success,
    ).toBe(false);
  });
});

describe("pembantu domain keluarga", () => {
  it("menyusun label keluarga dari nomor KK", () => {
    expect(keluargaLabel({ number: "3201012001120001" })).toBe("KK 3201012001120001");
  });

  it("memakai id katalog kepala keluarga yang benar", () => {
    expect(HEAD_OF_FAMILY_RELATION_ID).toBe(1);
  });
});
