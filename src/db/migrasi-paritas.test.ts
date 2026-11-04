import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Penjaga paritas skema vs migrasi.
 *
 * Skema Drizzle (`src/db/schema`) adalah sumber kebenaran bentuk tabel, tetapi
 * database baru hanya terbentuk dari berkas migrasi. Tanpa test ini, tabel yang
 * hanya dibuat lewat `db:push` akan lolos dari CI dan membuat modul gagal 500
 * pada instalasi bersih.
 *
 * Catatan: test ini statis (tanpa koneksi DB) agar tetap berjalan di job CI
 * yang tidak menyediakan MySQL.
 */

const SCHEMA_DIR = fileURLToPath(new URL("./schema/", import.meta.url));
const MIGRATIONS_DIR = fileURLToPath(new URL("./migrations/", import.meta.url));

function tabelSkema(): Set<string> {
  const hasil = new Set<string>();
  for (const berkas of fs.readdirSync(SCHEMA_DIR)) {
    if (!berkas.endsWith(".ts") || berkas.endsWith(".test.ts") || berkas === "index.ts") continue;
    const isi = fs.readFileSync(SCHEMA_DIR + berkas, "utf8");
    for (const cocok of isi.matchAll(/mysqlTable\(\s*"([a-z0-9_]+)"/g)) {
      const tabel = cocok[1];
      if (tabel) hasil.add(tabel);
    }
  }
  return hasil;
}

function tabelMigrasi(): Set<string> {
  const hasil = new Set<string>();
  for (const berkas of fs.readdirSync(MIGRATIONS_DIR)) {
    if (!berkas.endsWith(".sql")) continue;
    const isi = fs.readFileSync(MIGRATIONS_DIR + berkas, "utf8");
    for (const cocok of isi.matchAll(/CREATE TABLE (?:IF NOT EXISTS )?`([a-z0-9_]+)`/g)) {
      const tabel = cocok[1];
      if (tabel) hasil.add(tabel);
    }
  }
  return hasil;
}

function tagJournal(): string[] {
  const journal = JSON.parse(fs.readFileSync(MIGRATIONS_DIR + "meta/_journal.json", "utf8")) as {
    entries: Array<{ tag: string }>;
  };
  return journal.entries.map((entri) => entri.tag);
}

function berkasMigrasi(): string[] {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((berkas) => berkas.endsWith(".sql"))
    .map((berkas) => berkas.replace(/\.sql$/, ""));
}

describe("paritas skema vs migrasi", () => {
  it("setiap tabel pada skema dibuat oleh berkas migrasi", () => {
    const skema = tabelSkema();
    const migrasi = tabelMigrasi();
    const hilang = [...skema].filter((tabel) => !migrasi.has(tabel)).sort();

    expect(hilang).toEqual([]);
    expect(skema.size).toBeGreaterThan(0);
  });

  it("setiap berkas migrasi terdaftar di journal Drizzle", () => {
    const journal = new Set(tagJournal());
    const belumTerdaftar = berkasMigrasi()
      .filter((berkas) => !journal.has(berkas))
      .sort();

    expect(belumTerdaftar).toEqual([]);
  });

  it("tidak ada entri journal tanpa berkas migrasi", () => {
    const berkas = new Set(berkasMigrasi());
    const yatim = tagJournal()
      .filter((tag) => !berkas.has(tag))
      .sort();

    expect(yatim).toEqual([]);
  });
});
