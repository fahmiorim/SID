import { describe, expect, it } from "vitest";

import {
  balasPesanSchema,
  normalisasiNomorSms,
  pesanEmailMasukSchema,
  pesanSmsMasukSchema,
  susunPercakapanSms,
  tokenWebhookValid,
} from "./mailbox-sms";

describe("mailbox/sms domain", () => {
  it("menormalkan nomor SMS Indonesia", () => {
    expect(normalisasiNomorSms("+62 812-3456-7890")).toBe("081234567890");
    expect(normalisasiNomorSms("81234567890")).toBe("081234567890");
    expect(normalisasiNomorSms("0812 3456 7890")).toBe("081234567890");
  });

  it("memvalidasi payload webhook email dan SMS", () => {
    expect(
      pesanEmailMasukSchema.safeParse({ from: "warga@contoh.id", text: "Halo desa" }).success,
    ).toBe(true);
    expect(pesanEmailMasukSchema.safeParse({ from: "bukan-email", text: "Halo" }).success).toBe(
      false,
    );
    expect(pesanSmsMasukSchema.safeParse({ from: "08123", message: "Halo" }).success).toBe(true);
    expect(pesanSmsMasukSchema.safeParse({ from: "08123", message: "" }).success).toBe(false);
  });

  it("menolak balasan kosong dan menerima balasan wajar", () => {
    expect(balasPesanSchema.safeParse({ isi: "  " }).success).toBe(false);
    expect(balasPesanSchema.safeParse({ isi: "Terima kasih." }).success).toBe(true);
  });

  it("menyusun percakapan per nomor dengan hitungan belum dibaca", () => {
    const hasil = susunPercakapanSms([
      { nomor: "0812", createdAt: new Date("2026-11-06T10:00:00Z"), arah: "masuk", dibaca: false },
      { nomor: "0813", createdAt: new Date("2026-11-06T11:00:00Z"), arah: "masuk", dibaca: true },
      { nomor: "0812", createdAt: new Date("2026-11-06T12:00:00Z"), arah: "keluar", dibaca: true },
    ]);

    expect(hasil.map((item) => item.nomor)).toEqual(["0812", "0813"]);
    expect(hasil[0]?.pesan).toHaveLength(2);
    expect(hasil[0]?.belumDibaca).toBe(1);
  });

  it("memeriksa token webhook dengan perbandingan aman", () => {
    expect(tokenWebhookValid("rahasia", "rahasia")).toBe(true);
    expect(tokenWebhookValid("salah", "rahasia")).toBe(false);
    expect(tokenWebhookValid(null, "rahasia")).toBe(false);
    expect(tokenWebhookValid("rahasia", undefined)).toBe(false);
  });
});
