import { chmodSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { parseDatabaseUrl, restoreSqlDump } from "./restore";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/env", () => ({
  env: { DATABASE_URL: "mysql://pengguna:rahasia%40ku@db.contoh:3307/desa" },
}));

let direktori: string;
let berkasKeluaran: string;

function buatSkrip(isi: string): string {
  const path = join(direktori, `mysql-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  writeFileSync(path, isi);
  chmodSync(path, 0o755);
  return path;
}

beforeEach(() => {
  direktori = mkdtempSync(join(tmpdir(), "restore-uji-"));
  berkasKeluaran = join(direktori, "keluaran.sql");
  process.env.RESTORE_UJI_KELUARAN = berkasKeluaran;
});

afterEach(() => {
  delete process.env.RESTORE_UJI_KELUARAN;
});

describe("parseDatabaseUrl", () => {
  it("membaca kredensial, port, dan nama basis data", () => {
    expect(parseDatabaseUrl("mysql://pengguna:rahasia%40ku@db.contoh:3307/desa")).toEqual({
      username: "pengguna",
      password: "rahasia@ku",
      host: "db.contoh",
      port: "3307",
      database: "desa",
    });
  });

  it("memakai port 3306 bila tidak disebutkan", () => {
    expect(parseDatabaseUrl("mysql://u:p@localhost/desa").port).toBe("3306");
  });
});

describe("restoreSqlDump", () => {
  it("meneruskan isi dump ke proses mysql", async () => {
    const skrip = buatSkrip('#!/bin/sh\ncat > "$RESTORE_UJI_KELUARAN"\n');

    await restoreSqlDump(Buffer.from("CREATE TABLE uji (id INT);"), { mysqlBin: skrip });

    expect(readFileSync(berkasKeluaran, "utf8")).toBe("CREATE TABLE uji (id INT);");
  });

  it("membuka gzip sebelum meneruskan dump", async () => {
    const skrip = buatSkrip('#!/bin/sh\ncat > "$RESTORE_UJI_KELUARAN"\n');
    const isi = "INSERT INTO uji VALUES (1);";

    await restoreSqlDump(gzipSync(Buffer.from(isi)), { gzip: true, mysqlBin: skrip });

    expect(readFileSync(berkasKeluaran, "utf8")).toBe(isi);
  });

  it("menolak dengan pesan stderr saat mysql keluar gagal", async () => {
    const skrip = buatSkrip('#!/bin/sh\necho "akses ditolak" >&2\nexit 2\n');

    await expect(restoreSqlDump(Buffer.from("SELECT 1;"), { mysqlBin: skrip })).rejects.toThrow(
      "akses ditolak",
    );
  });
});
