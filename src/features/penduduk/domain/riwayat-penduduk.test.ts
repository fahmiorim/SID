import { describe, expect, it } from "vitest";

import {
  catatDatangSchema,
  catatKelahiranSchema,
  catatKematianSchema,
  catatPindahKeluarSchema,
  MUTATION_TYPE_LABELS,
  MUTATION_TYPES,
} from "@/features/penduduk/domain/riwayat-penduduk";

const kelahiran = {
  eventDate: "2026-10-25",
  name: "  Bayi Baru ",
  nationalId: "3201012001120001",
  gender: "female",
  familyId: "",
  regionId: "",
  address: "",
  fatherName: "",
  motherName: "",
  reason: "",
  notes: "",
  referenceNo: "",
};

const kedatangan = {
  eventDate: "2026-10-25",
  name: "Warga Datang",
  nationalId: "",
  gender: "",
  birthDate: "",
  birthPlace: "",
  familyId: "",
  regionId: "",
  address: "",
  fromAddress: "",
  reason: "",
  notes: "",
  referenceNo: "",
};

describe("skema riwayat penduduk", () => {
  it("memetakan setiap jenis mutasi ke label", () => {
    for (const type of MUTATION_TYPES) {
      expect(MUTATION_TYPE_LABELS[type]).toBeTruthy();
    }
  });

  it("menerima kelahiran valid dan mengosongkan pilihan kosong", () => {
    const parsed = catatKelahiranSchema.parse(kelahiran);

    expect(parsed.name).toBe("Bayi Baru");
    expect(parsed.familyId).toBeNull();
    expect(parsed.regionId).toBeNull();
    expect(parsed.nationalId).toBe("3201012001120001");
  });

  it("menolak NIK dan tanggal yang tidak valid", () => {
    expect(catatKelahiranSchema.safeParse({ ...kelahiran, nationalId: "123" }).success).toBe(false);
    expect(catatKelahiranSchema.safeParse({ ...kelahiran, eventDate: "25-10-2026" }).success).toBe(
      false,
    );
  });

  it("menerima kedatangan tanpa tanggal lahir", () => {
    const parsed = catatDatangSchema.parse(kedatangan);

    expect(parsed.birthDate).toBeNull();
    expect(parsed.nationalId).toBeNull();
  });

  it("mewajibkan penduduk pada kematian dan pindah keluar", () => {
    expect(
      catatKematianSchema.safeParse({ residentId: "0", eventDate: "2026-10-25" }).success,
    ).toBe(false);
    expect(
      catatPindahKeluarSchema.safeParse({ residentId: "", eventDate: "2026-10-25" }).success,
    ).toBe(false);
  });
});
