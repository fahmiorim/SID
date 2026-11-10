import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Guard batas lapisan seluruh route aplikasi.
 *
 * Nama berkas dipertahankan agar rujukan dokumen tetap, tetapi cakupannya kini
 * bukan hanya route publik: admin, warga, publik, dan API sama-sama wajib
 * melewati use case, bukan mengimpor `@/db` atau folder infrastructure fitur.
 */
const AKAR_APP = path.join(process.cwd(), "src", "app");
const POLA_INFRASTRUKTUR = /from\s+["']@\/features\/[^"']+\/infrastructure\/|from\s+["']@\/db["']/;

function daftarBerkas(direktori: string): string[] {
  return readdirSync(direktori, { withFileTypes: true }).flatMap((entri) => {
    const penuh = path.join(direktori, entri.name);
    if (entri.isDirectory()) return daftarBerkas(penuh);
    if (!/\.(ts|tsx)$/.test(entri.name) || /\.test\.tsx?$/.test(entri.name)) return [];
    return [penuh];
  });
}

function relatif(berkas: string): string {
  return path.relative(process.cwd(), berkas).replaceAll("\\", "/");
}

const BERKAS_APP = daftarBerkas(AKAR_APP);

describe("batas lapisan route aplikasi", () => {
  it("mencakup route admin, warga, publik, dan API", () => {
    const jalur = BERKAS_APP.map(relatif);

    expect(jalur.filter((berkas) => berkas.startsWith("src/app/(admin)/")).length).toBeGreaterThan(
      0,
    );
    expect(jalur.filter((berkas) => berkas.startsWith("src/app/(warga)/")).length).toBeGreaterThan(
      0,
    );
    expect(jalur.filter((berkas) => berkas.startsWith("src/app/(public)/")).length).toBeGreaterThan(
      0,
    );
    expect(jalur.filter((berkas) => berkas.startsWith("src/app/api/")).length).toBeGreaterThan(0);
  });

  it("tidak mengimpor infrastruktur atau db secara langsung", () => {
    const pelanggaran = BERKAS_APP.filter((berkas) =>
      POLA_INFRASTRUKTUR.test(readFileSync(berkas, "utf8")),
    ).map(relatif);

    expect(pelanggaran).toEqual([]);
  });
});
