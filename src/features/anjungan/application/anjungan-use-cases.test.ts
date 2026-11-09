import { beforeEach, describe, expect, it, vi } from "vitest";

import * as dal from "@/lib/dal";

import * as repo from "../infrastructure/anjungan-repository";
import { tambahAnjungan, ubahAnjungan } from "./anjungan-use-cases";

vi.mock("@/lib/dal", () => ({ requirePermission: vi.fn() }));

vi.mock("../infrastructure/anjungan-repository", () => ({
  createAnjungan: vi.fn(),
  deleteAnjungan: vi.fn(),
  listAnjungan: vi.fn(async () => []),
  updateAnjungan: vi.fn(),
}));

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe("tambahAnjungan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(repo.createAnjungan).mockResolvedValue(12);
  });

  it("membuat UUID otomatis bila field dikirim kosong", async () => {
    const hasil = await tambahAnjungan(7, { nama: "Anjungan Surat", uuid: "" });

    expect(dal.requirePermission).toHaveBeenCalledWith("anjungan", "update");
    expect(repo.createAnjungan).toHaveBeenCalledWith(
      expect.objectContaining({
        villageId: 7,
        nama: "Anjungan Surat",
        uuid: expect.stringMatching(UUID_V4),
      }),
    );
    expect(hasil).toEqual({ id: 12 });
  });

  it("tidak menyimpan bila UUID yang diisi tidak valid", async () => {
    await expect(tambahAnjungan(7, { nama: "Anjungan Surat", uuid: "bukan-uuid" })).rejects.toThrow(
      "UUID tidak valid",
    );

    expect(repo.createAnjungan).not.toHaveBeenCalled();
  });
});

describe("ubahAnjungan", () => {
  beforeEach(() => vi.clearAllMocks());

  it("mengisi UUID baru bila data lama tidak punya UUID", async () => {
    await ubahAnjungan(7, 3, { nama: "Anjungan Surat", uuid: "" });

    expect(dal.requirePermission).toHaveBeenCalledWith("anjungan", "update");
    expect(repo.updateAnjungan).toHaveBeenCalledWith(
      3,
      7,
      expect.objectContaining({
        nama: "Anjungan Surat",
        uuid: expect.stringMatching(UUID_V4),
      }),
    );
  });
});
