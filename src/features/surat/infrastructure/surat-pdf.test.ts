import { describe, expect, it } from "vitest";

import { buildSuratPdf, type SuratPdfInput } from "./surat-pdf";

function input(verificationUrl: string | null): SuratPdfInput {
  return {
    desa: {
      namaDesa: "Sukamaju",
      kodeDesa: "3201",
      namaKecamatan: "Contoh",
      namaKabupaten: "Contoh",
      namaPropinsi: "Jawa Barat",
      alamatKantor: "Jl. Desa No. 1",
      telepon: "0812",
      emailDesa: "desa@example.id",
      namaKepalaDesa: "Budi",
      nipKepalaDesa: "123",
    },
    jenisNama: "Surat Keterangan",
    nomor: "001/SK/2026",
    tanggal: "2026-10-24",
    content: "Isi surat uji coba.",
    verificationUrl,
  };
}

describe("buildSuratPdf", () => {
  it("menghasilkan PDF valid tanpa tautan verifikasi", async () => {
    const pdf = await buildSuratPdf(input(null));

    expect(Buffer.from(pdf).subarray(0, 4).toString()).toBe("%PDF");
    expect(pdf.length).toBeGreaterThan(1000);
  });

  it("menambahkan QR verifikasi sehingga PDF lebih besar", async () => {
    const tanpaQr = await buildSuratPdf(input(null));
    const denganQr = await buildSuratPdf(
      input("https://desa.example.id/desa/verifikasi-surat/abc123"),
    );

    expect(Buffer.from(denganQr).subarray(0, 4).toString()).toBe("%PDF");
    // Gambar QR tertanam — berkas pasti bertambah beberapa ratus byte.
    expect(denganQr.length).toBeGreaterThan(tanpaQr.length + 100);
  });
});
