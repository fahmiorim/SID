import { beforeEach, describe, expect, it, vi } from "vitest";

import * as dal from "@/lib/dal";

import * as sms from "../infrastructure/kirim-sms";
import * as repo from "../infrastructure/mailbox-sms-repository";
import * as kirim from "./kirim-notifikasi";
import {
  ambilKotakMasukAdmin,
  balasEmailMasuk,
  balasSmsMasuk,
  terimaEmailMasuk,
  terimaSmsMasuk,
} from "./mailbox-sms-use-cases";

vi.mock("@/lib/dal", () => ({ requirePermission: vi.fn() }));
vi.mock("@/features/desa/application/resolve-village", () => ({
  resolveVillageId: vi.fn(async () => 7),
}));
vi.mock("../infrastructure/mailbox-sms-repository", () => ({
  listMailbox: vi.fn(),
  cariMailbox: vi.fn(),
  listSms: vi.fn(),
  tambahMailbox: vi.fn(),
  tambahSms: vi.fn(),
  tandaiMailboxDibaca: vi.fn(),
  tandaiSmsNomorDibaca: vi.fn(),
}));
vi.mock("../infrastructure/kirim-sms", () => ({ kirimSms: vi.fn() }));
vi.mock("./kirim-notifikasi", () => ({ kirimNotifikasi: vi.fn() }));

const user = { id: "u-1", villageId: 7 } as never;

describe("mailbox/SMS use cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dal.requirePermission).mockResolvedValue(user);
  });

  it("memuat kotak masuk dan percakapan SMS dari desa sesi", async () => {
    vi.mocked(repo.listMailbox).mockResolvedValueOnce([]);
    vi.mocked(repo.listSms).mockResolvedValueOnce([
      {
        id: 1,
        arah: "masuk",
        nomor: "0812",
        isi: "Halo",
        status: "diterima",
        dibaca: false,
        createdAt: new Date(),
      },
    ]);

    const hasil = await ambilKotakMasukAdmin();

    expect(dal.requirePermission).toHaveBeenCalledWith("notifikasi", "read");
    expect(repo.listMailbox).toHaveBeenCalledWith(7);
    expect(hasil.percakapan[0]?.nomor).toBe("0812");
  });

  it("membalas email masuk dan menyimpan salinan keluar", async () => {
    vi.mocked(repo.cariMailbox).mockResolvedValueOnce({
      id: 3,
      villageId: 7,
      arah: "masuk",
      alamat: "warga@contoh.id",
      subjek: "Tanya",
      isi: "Halo",
      dibaca: false,
      createdAt: new Date(),
    });
    vi.mocked(kirim.kirimNotifikasi).mockResolvedValueOnce({ sukses: true, dilewati: false });

    const hasil = await balasEmailMasuk({ id: 3, isi: "Terima kasih." });

    expect(kirim.kirimNotifikasi).toHaveBeenCalledWith(
      expect.objectContaining({ target: "warga@contoh.id", kanal: "email", villageId: 7 }),
    );
    expect(repo.tambahMailbox).toHaveBeenCalledWith(
      expect.objectContaining({ arah: "keluar", isi: "Terima kasih." }),
    );
    expect(repo.tandaiMailboxDibaca).toHaveBeenCalledWith(7, 3);
    expect(hasil.sukses).toBe(true);
  });

  it("membalas SMS dan mencatat status pengiriman", async () => {
    vi.mocked(sms.kirimSms).mockResolvedValueOnce({ sukses: true, dilewati: false });

    await balasSmsMasuk({ nomor: "+62 812-3456", isi: "Sudah kami proses." });

    expect(sms.kirimSms).toHaveBeenCalledWith("08123456", "Sudah kami proses.");
    expect(repo.tambahSms).toHaveBeenCalledWith(
      expect.objectContaining({ arah: "keluar", nomor: "08123456", status: "terkirim" }),
    );
  });

  it("menyimpan email dan SMS masuk dari webhook", async () => {
    await terimaEmailMasuk(7, { from: "warga@contoh.id", subject: "Halo", text: "Isi" });
    await terimaSmsMasuk(7, { from: "0812-3456", message: "Halo desa", id: "p-1" });

    expect(repo.tambahMailbox).toHaveBeenCalledWith(
      expect.objectContaining({ villageId: 7, arah: "masuk", alamat: "warga@contoh.id" }),
    );
    expect(repo.tambahSms).toHaveBeenCalledWith(
      expect.objectContaining({
        villageId: 7,
        arah: "masuk",
        nomor: "08123456",
        providerId: "p-1",
      }),
    );
  });

  it("menolak payload webhook yang tidak valid", async () => {
    await expect(terimaEmailMasuk(7, { from: "bukan-email", text: "" })).rejects.toThrow(
      "tidak valid",
    );
  });
});
