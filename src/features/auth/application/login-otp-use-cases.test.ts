import { beforeEach, describe, expect, it, vi } from "vitest";

import * as notifikasi from "@/features/notifikasi/application/kirim-notifikasi";
import * as batas from "@/features/rate-limit/application/rate-limit";

import * as authRepo from "../infrastructure/auth-repository";
import * as repo from "../infrastructure/login-otp-repository";
import { mintaKodeLogin, verifikasiKodeLogin } from "./login-otp-use-cases";

vi.mock("@/features/rate-limit/application/rate-limit", () => ({ batasiPermintaan: vi.fn() }));
vi.mock("@/features/notifikasi/application/kirim-notifikasi", () => ({ kirimNotifikasi: vi.fn() }));
vi.mock("../infrastructure/auth-repository", () => ({
  getLoginOtpContext: vi.fn(),
  getOtpLoginTarget: vi.fn(),
}));
vi.mock("../infrastructure/login-otp-repository", () => ({
  findKodeLoginAktif: vi.fn(),
  simpanKodeLogin: vi.fn(),
  tambahPercobaanLogin: vi.fn(),
  tandaiKodeLoginTerpakai: vi.fn(),
}));

const konteks = {
  id: "u-1",
  active: true,
  otpLoginAktif: true,
  villageId: 2,
  residentId: 9,
  email: "warga@contoh.id",
  phone: "08123456789",
};

describe("mintaKodeLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(batas.batasiPermintaan).mockResolvedValue({
      dibatasi: false,
      sisa: 2,
      resetMs: 0,
    });
  });

  it("membalas generik untuk akun tanpa OTP tanpa mengirim apa pun", async () => {
    vi.mocked(authRepo.getLoginOtpContext).mockResolvedValueOnce({
      ...konteks,
      otpLoginAktif: false,
    });

    const hasil = await mintaKodeLogin("warga");

    expect(hasil.terkirim).toBe(false);
    expect(repo.simpanKodeLogin).not.toHaveBeenCalled();
    expect(notifikasi.kirimNotifikasi).not.toHaveBeenCalled();
  });

  it("menyimpan hash kode dan mengirim WhatsApp untuk akun ber-OTP", async () => {
    vi.mocked(authRepo.getLoginOtpContext).mockResolvedValueOnce(konteks);

    const hasil = await mintaKodeLogin("warga");

    const simpan = vi.mocked(repo.simpanKodeLogin).mock.calls[0]?.[0];
    expect(simpan?.kodeHash).toHaveLength(64);
    expect(simpan?.kanal).toBe("whatsapp");
    expect(simpan?.target).toBe("08123456789");
    expect(notifikasi.kirimNotifikasi).toHaveBeenCalledWith(
      expect.objectContaining({ kanal: "whatsapp", jenis: "auth.login.otp" }),
    );
    expect(hasil.terkirim).toBe(true);
  });

  it("menolak saat batas permintaan terlampaui", async () => {
    vi.mocked(authRepo.getLoginOtpContext).mockResolvedValueOnce(konteks);
    vi.mocked(batas.batasiPermintaan).mockResolvedValueOnce({
      dibatasi: true,
      sisa: 0,
      resetMs: 1000,
    });

    const hasil = await mintaKodeLogin("warga");

    expect(hasil.terkirim).toBe(false);
    expect(hasil.pesan).toContain("Terlalu banyak");
    expect(repo.simpanKodeLogin).not.toHaveBeenCalled();
  });
});

describe("verifikasiKodeLogin", () => {
  beforeEach(() => vi.clearAllMocks());

  it("mencatat percobaan dan menolak kode salah", async () => {
    vi.mocked(repo.findKodeLoginAktif).mockResolvedValueOnce({
      id: 5,
      userId: "u-1",
      kanal: "whatsapp",
      target: "08123456789",
      kodeHash: "hash-lain",
      kedaluwarsa: new Date(Date.now() + 60_000),
      percobaan: 0,
      terpakaiAt: null,
      createdAt: new Date(),
    });

    await expect(verifikasiKodeLogin("u-1", "123456")).rejects.toThrow("salah");
    expect(repo.tambahPercobaanLogin).toHaveBeenCalledWith(5);
    expect(repo.tandaiKodeLoginTerpakai).not.toHaveBeenCalled();
  });
});
