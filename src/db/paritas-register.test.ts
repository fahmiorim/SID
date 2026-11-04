import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Penjaga integritas register paritas.
 *
 * `PARITAS-OPENSID.md` adalah sumber kebenaran status, sementara
 * `KATALOG-FITUR-OPENSID.md` adalah sumber scope. Keduanya harus memuat
 * himpunan ID yang sama, tepat satu baris per ID, dengan status yang sah.
 * Tanpa test ini, baris duplikat dan ID yang hilang pernah lolos ke dokumen.
 */

const DOCS = fileURLToPath(new URL("../../docs/", import.meta.url));

const STATUS_SAH = ["✅", "🟡", "🔴", "⚪"] as const;

function baca(nama: string): string {
  return fs.readFileSync(DOCS + nama, "utf8");
}

function idKatalog(): string[] {
  return [...baca("KATALOG-FITUR-OPENSID.md").matchAll(/^\|\s*(OS-[A-Z]+-\d+)\s*\|/gm)]
    .map((cocok) => cocok[1])
    .filter((id): id is string => Boolean(id));
}

interface BarisRegister {
  id: string;
  status: string;
}

function barisRegister(): BarisRegister[] {
  return baca("PARITAS-OPENSID.md")
    .split(/\r?\n/)
    .filter((baris) => /^\|\s*OS-/.test(baris))
    .map((baris) => {
      const kolom = baris.split("|").map((sel) => sel.trim());
      return { id: kolom[1] ?? "", status: kolom[2] ?? "" };
    });
}

describe("register paritas", () => {
  it("memuat setiap ID katalog tepat satu baris", () => {
    const katalog = idKatalog();
    const register = barisRegister();
    const hitung = new Map<string, number>();
    for (const { id } of register) hitung.set(id, (hitung.get(id) ?? 0) + 1);

    const duplikat = [...hitung.entries()]
      .filter(([, jumlah]) => jumlah > 1)
      .map(([id]) => id)
      .sort();
    const hilang = katalog.filter((id) => !hitung.has(id)).sort();
    const asing = [...hitung.keys()].filter((id) => !katalog.includes(id)).sort();

    expect({ duplikat, hilang, asing }).toEqual({ duplikat: [], hilang: [], asing: [] });
    expect(register).toHaveLength(katalog.length);
  });

  it("memberi status yang sah pada setiap baris", () => {
    const tidakSah = barisRegister()
      .filter(({ status }) => !STATUS_SAH.some((sah) => status.includes(sah)))
      .map(({ id, status }) => `${id}: ${status}`);

    expect(tidakSah).toEqual([]);
  });

  it("ringkasan pada dokumen sama dengan hitungan baris", () => {
    const register = barisRegister();
    const hitung = {
      "✅": register.filter(({ status }) => status.includes("✅")).length,
      "🟡": register.filter(({ status }) => status.includes("🟡")).length,
      "🔴": register.filter(({ status }) => status.includes("🔴")).length,
      "⚪": register.filter(({ status }) => status.includes("⚪")).length,
    };

    const ringkasan = baca("PARITAS-OPENSID.md")
      .split(/\r?\n/)
      .find((baris) => baris.startsWith("| **Katalog per-ID"));
    expect(ringkasan, "baris ringkasan paritas tidak ditemukan").toBeDefined();

    const kolom = (ringkasan ?? "")
      .split("|")
      .map((sel) => sel.replaceAll("*", "").trim())
      .filter(Boolean)
      .slice(1);

    expect(kolom.map(Number)).toEqual([
      register.length,
      hitung["✅"],
      hitung["🟡"],
      hitung["🔴"],
      hitung["⚪"],
    ]);
  });
});
