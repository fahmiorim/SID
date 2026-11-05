import { describe, expect, it } from "vitest";

import {
  buatSecretTotp,
  decodeBase32,
  encodeBase32,
  generateTotpCode,
  hashKodeTotp,
  PANJANG_SECRET_TOTP,
  PANJANG_TOTP,
  verifikasiTotpCode,
} from "./totp";

describe("totp domain", () => {
  it("buatSecretTotp menghasilkan base32 valid", () => {
    const secret = buatSecretTotp();
    expect(secret.length).toBe(PANJANG_SECRET_TOTP);
    expect(secret).toMatch(/^[A-Z2-7]+$/);
  });

  it("encode/decode base32 round-trip", () => {
    const original = Buffer.from("hello world");
    const encoded = encodeBase32(original);
    const decoded = decodeBase32(encoded);
    expect(decoded).toEqual(original);
  });

  it("generateTotpCode menghasilkan 6 digit angka", () => {
    const secret = buatSecretTotp();
    const code = generateTotpCode(secret);
    expect(code.length).toBe(PANJANG_TOTP);
    expect(code).toMatch(/^\d+$/);
  });

  it("verifikasiTotpCode menerima kode yang valid", () => {
    const secret = buatSecretTotp();
    const code = generateTotpCode(secret);
    expect(verifikasiTotpCode(secret, code)).toBe(true);
  });

  it("verifikasiTotpCode menolak kode yang salah", () => {
    const secret = buatSecretTotp();
    expect(verifikasiTotpCode(secret, "000000")).toBe(false);
  });

  it("verifikasiTotpCode toleransi clock skew ±1 periode", () => {
    const secret = buatSecretTotp();
    const now = Date.now();
    const codeNow = generateTotpCode(secret, now);
    const codePrev = generateTotpCode(secret, now - 30_000);
    const codeNext = generateTotpCode(secret, now + 30_000);

    expect(verifikasiTotpCode(secret, codeNow, now)).toBe(true);
    expect(verifikasiTotpCode(secret, codePrev, now)).toBe(true);
    expect(verifikasiTotpCode(secret, codeNext, now)).toBe(true);
  });

  it("verifikasiTotpCode menolak kode di luar toleransi", () => {
    const secret = buatSecretTotp();
    const now = Date.now();
    const codeOld = generateTotpCode(secret, now - 61_000);
    const codeFuture = generateTotpCode(secret, now + 61_000);

    expect(verifikasiTotpCode(secret, codeOld, now)).toBe(false);
    expect(verifikasiTotpCode(secret, codeFuture, now)).toBe(false);
  });

  it("hashKodeTotp menghasilkan SHA-256 hex", () => {
    const hash = hashKodeTotp("123456");
    expect(hash.length).toBe(64);
    expect(hash).toMatch(/^[a-f0-9]+$/);
  });
});
