import { chmodSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { parseDatabaseUrl, restoreSqlDump } from "./restore";

/**
 * Windows tidak dapat menjalankan skrip `#!/bin/sh` lewat `spawn` tanpa shell
 * (`ENOENT`/`EINVAL`). Karena itu, **hanya di Windows**, `node:child_process`
 * diganti proses tiruan yang meniru stdin, stderr, dan event `close`.
 *
 * Di Linux/macOS factory mengembalikan modul asli, sehingga pengujian tetap
 * menjalankan proses `mysql` tiruan sungguhan seperti sebelumnya.
 */
const uji = vi.hoisted(() => ({
  windows: process.platform === "win32",
  mode: { nilai: "sukses" as "sukses" | "gagal" },
}));

vi.mock("node:child_process", async (importOriginal) => {
  const asli = (await importOriginal()) as Record<string, unknown>;
  if (!uji.windows) return asli;

  const { EventEmitter } = await import("node:events");
  const { Writable } = await import("node:stream");
  const { writeFileSync: tulisBerkas } = await import("node:fs");

  const spawnTiruan = (() => {
    const emitter = new EventEmitter();
    const potongan: Buffer[] = [];
    const stderr = new EventEmitter();

    const stdin = new Writable({
      write(chunk, _encoding, callback) {
        potongan.push(Buffer.from(chunk));
        callback();
      },
      final(callback) {
        if (uji.mode.nilai === "gagal") {
          stderr.emit("data", Buffer.from("akses ditolak"));
          queueMicrotask(() => emitter.emit("close", 2));
        } else {
          tulisBerkas(process.env.RESTORE_UJI_KELUARAN ?? "", Buffer.concat(potongan));
          queueMicrotask(() => emitter.emit("close", 0));
        }
        callback();
      },
    });

    Object.assign(emitter, { stdin, stderr });
    return emitter;
  }) as unknown;

  return { ...asli, spawn: spawnTiruan };
});

vi.mock("server-only", () => ({}));
vi.mock("@/lib/env", () => ({
  env: { DATABASE_URL: "mysql://pengguna:rahasia%40ku@db.contoh:3307/desa" },
}));

let direktori: string;
let berkasKeluaran: string;

function buatSkrip(isi: string): string {
  const path = join(direktori, `mysql-${Date.now()}-${Math.random().toString(16).slice(2)}`);

  if (uji.windows) {
    // Tidak dieksekusi: `spawn` diganti proses tiruan di atas.
    writeFileSync(path, "");
    return path;
  }

  writeFileSync(path, isi);
  chmodSync(path, 0o755);
  return path;
}

beforeEach(() => {
  direktori = mkdtempSync(join(tmpdir(), "restore-uji-"));
  berkasKeluaran = join(direktori, "keluaran.sql");
  process.env.RESTORE_UJI_KELUARAN = berkasKeluaran;
  uji.mode.nilai = "sukses";
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
    uji.mode.nilai = "gagal";

    await expect(restoreSqlDump(Buffer.from("SELECT 1;"), { mysqlBin: skrip })).rejects.toThrow(
      "akses ditolak",
    );
  });
});
