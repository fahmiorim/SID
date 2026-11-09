import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const AKAR_APP = path.join(process.cwd(), "src", "app");
const DIREKTORI_PUBLIK = ["(public)/desa", "api/publik"];
const BERKAS_PUBLIK = [path.join(AKAR_APP, "sitemap.ts")];
const POLA_INFRASTRUKTUR = /from\s+["']@\/features\/[^"']+\/infrastructure\/|from\s+["']@\/db["']/;

function daftarBerkas(direktori: string): string[] {
  return readdirSync(direktori, { withFileTypes: true }).flatMap((entri) => {
    const penuh = path.join(direktori, entri.name);
    if (entri.isDirectory()) return daftarBerkas(penuh);
    if (!/\.(ts|tsx)$/.test(entri.name) || /\.test\.tsx?$/.test(entri.name)) return [];
    return [penuh];
  });
}

describe("batas lapisan route publik", () => {
  it("tidak mengimpor infrastruktur atau db secara langsung", () => {
    const pelanggaran = [
      ...DIREKTORI_PUBLIK.flatMap((relatif) => daftarBerkas(path.join(AKAR_APP, relatif))),
      ...BERKAS_PUBLIK,
    ]
      .filter((berkas) => POLA_INFRASTRUKTUR.test(readFileSync(berkas, "utf8")))
      .map((berkas) => path.relative(process.cwd(), berkas).replaceAll("\\", "/"));

    expect(pelanggaran).toEqual([]);
  });
});
