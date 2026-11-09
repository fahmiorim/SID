import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const DOCS = fileURLToPath(new URL("../../docs/", import.meta.url));

function baca(nama: string): string {
  return fs.readFileSync(DOCS + nama, "utf8");
}

describe("dokumentasi scope dan status", () => {
  it("mencatat snapshot OpenSID dan pengecualian OpenDK, SMS, serta Covid-19", () => {
    const scope = baca("CAKUPAN-OPENSID.md");

    expect(scope).toContain("v2607.0.1");
    expect(scope).toContain("661a8884a8d02c26b1877d1cdddda0a06dd41361");
    expect(scope).toContain("OpenDK");
    expect(scope).toContain("SMS");
    expect(scope).toContain("Covid-19");
    expect(scope).toContain("Vaksin Covid");
    expect(scope).toContain("Katalog lama memuat 111 ID");
    expect(scope).toContain("bukan jumlah total fitur");
  });

  it("membedakan bukti kode/test dari status fitur selesai", () => {
    const status = baca("STATUS-MODUL.md");

    expect(status).toContain("Belum diaudit");
    expect(status).toContain("bukan bukti fitur selesai");
    expect(status).toContain("UI");
    expect(status).toContain("pengujian");
  });

  it("menghubungkan rencana perbaikan dengan audit dan pengujian", () => {
    const rencana = baca("RENCANA-PENGEMBANGAN.md");

    expect(rencana).toContain("audit inventaris");
    expect(rencana).toContain("uji unit");
    expect(rencana).toContain("uji integrasi");
    expect(rencana).toContain("uji E2E");
  });

  it("peta dokumentasi aktif tidak mengarahkan ke dokumen status lama", () => {
    const peta = baca("README.md");

    expect(peta).toContain("CAKUPAN-OPENSID.md");
    expect(peta).toContain("STATUS-MODUL.md");
    expect(peta).toContain("RENCANA-PENGEMBANGAN.md");
    expect(peta).not.toContain("PARITAS-OPENSID.md");
    expect(peta).not.toContain("KATALOG-FITUR-OPENSID.md");
  });
});
