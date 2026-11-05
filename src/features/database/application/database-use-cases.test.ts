import { beforeEach, describe, expect, it, vi } from "vitest";

import * as audit from "@/features/audit/application/audit-use-cases";
import * as dal from "@/lib/dal";

import * as restore from "../infrastructure/restore";
import * as verifikasi from "../infrastructure/verifikasi-restore";
import { pulihkanBackupSql } from "./database-use-cases";

vi.mock("@/lib/dal", () => ({ requirePermission: vi.fn() }));
vi.mock("@/features/desa/application/resolve-village", () => ({
  resolveVillageId: vi.fn(async () => 7),
}));
vi.mock("@/features/audit/application/audit-use-cases", () => ({ recordAuditEvent: vi.fn() }));
vi.mock("../infrastructure/restore", () => ({ restoreSqlDump: vi.fn(async () => {}) }));
vi.mock("../infrastructure/verifikasi-restore", () => ({
  verifikasiPascaRestore: vi.fn(async () => {}),
}));

const user = { id: "u-1", villageId: 7 } as never;

function input(overrides: Partial<Parameters<typeof pulihkanBackupSql>[0]> = {}) {
  return {
    filename: "backup.sql",
    size: 10,
    buffer: Buffer.from("SELECT 1;"),
    konfirmasi: true,
    ...overrides,
  };
}

describe("pulihkanBackupSql", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dal.requirePermission).mockResolvedValue(user);
  });

  it("menolak restore tanpa konfirmasi", async () => {
    await expect(pulihkanBackupSql(input({ konfirmasi: false }))).rejects.toThrow("Konfirmasi");
    expect(restore.restoreSqlDump).not.toHaveBeenCalled();
  });

  it("menolak berkas melebihi 200 MB", async () => {
    await expect(pulihkanBackupSql(input({ size: 201 * 1024 * 1024 }))).rejects.toThrow("200 MB");
    expect(restore.restoreSqlDump).not.toHaveBeenCalled();
  });

  it("menolak ekstensi selain sql/sql.gz", async () => {
    await expect(pulihkanBackupSql(input({ filename: "backup.zip" }))).rejects.toThrow(".sql");
    expect(restore.restoreSqlDump).not.toHaveBeenCalled();
  });

  it("menjalankan restore, verifikasi skema, lalu audit", async () => {
    await pulihkanBackupSql(input());

    expect(restore.restoreSqlDump).toHaveBeenCalledWith(expect.any(Buffer), { gzip: false });
    expect(verifikasi.verifikasiPascaRestore).toHaveBeenCalled();
    expect(audit.recordAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({ event: "database.restore", villageId: 7 }),
    );
  });

  it("meneruskan flag gzip untuk berkas .sql.gz", async () => {
    await pulihkanBackupSql(input({ filename: "backup.sql.gz" }));

    expect(restore.restoreSqlDump).toHaveBeenCalledWith(expect.any(Buffer), { gzip: true });
  });

  it("tidak mengaudit bila verifikasi skema gagal", async () => {
    vi.mocked(verifikasi.verifikasiPascaRestore).mockRejectedValueOnce(
      new Error("Restore tidak lengkap"),
    );

    await expect(pulihkanBackupSql(input())).rejects.toThrow("tidak lengkap");
    expect(audit.recordAuditEvent).not.toHaveBeenCalled();
  });
});
