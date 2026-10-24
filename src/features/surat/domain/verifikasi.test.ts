import { describe, expect, it } from "vitest";

import { buildVerificationUrl } from "./verifikasi";

describe("buildVerificationUrl", () => {
  it("menyusun tautan verifikasi dari origin & token", () => {
    expect(buildVerificationUrl("https://desa-sukamaju.id", "abc123")).toBe(
      "https://desa-sukamaju.id/desa/verifikasi-surat/abc123",
    );
  });

  it("menghapus garis miring berlebih di akhir origin", () => {
    expect(buildVerificationUrl("https://desa.id///", "abc")).toBe(
      "https://desa.id/desa/verifikasi-surat/abc",
    );
  });

  it("memangkas spasi dan meng-encode token", () => {
    expect(buildVerificationUrl(" http://localhost:3000 ", "  a b/c  ")).toBe(
      "http://localhost:3000/desa/verifikasi-surat/a%20b%2Fc",
    );
  });
});
