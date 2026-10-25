import "server-only";

import { recordAuditEvent } from "@/features/audit/application/audit-use-cases";
import { AUDIT_EVENTS } from "@/features/audit/domain/audit";
import {
  isAllowedSqlFile,
  MAX_RESTORE_BYTES,
  normalizeSqlFilename,
} from "@/features/database/domain/database";
import { createSqlBackup } from "@/features/database/infrastructure/backup";
import { restoreSqlDump } from "@/features/database/infrastructure/restore";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { requirePermission } from "@/lib/dal";
import { validationError } from "@/lib/errors";

function getRequestContext() {
  return {
    ipAddress: null,
    userAgent: null,
  };
}

export async function unduhBackupSql(gzip = true) {
  const user = await requirePermission(RESOURCES.database, "delete");
  const villageId = await resolveVillageId(user);
  const result = await createSqlBackup({ gzip });
  await recordAuditEvent({
    villageId,
    actorId: user.id,
    event: AUDIT_EVENTS.databaseBackup,
    resource: RESOURCES.database,
    resourceId: "backup",
    details: { aksi: "backup", format: gzip ? "gz" : "sql" },
    ...getRequestContext(),
  });
  return result;
}

export async function pulihkanBackupSql(input: {
  filename: string;
  size: number;
  buffer: Buffer;
  konfirmasi: boolean;
}) {
  const user = await requirePermission(RESOURCES.database, "delete");
  if (!input.konfirmasi) {
    throw validationError("Konfirmasi restore diperlukan untuk melindungi data.");
  }
  if (input.size > MAX_RESTORE_BYTES) {
    throw validationError("Ukuran berkas restore melebihi batas 200 MB.");
  }
  if (!isAllowedSqlFile(input.filename)) {
    throw validationError("Hanya berkas .sql atau .sql.gz yang diizinkan.");
  }
  const villageId = await resolveVillageId(user);
  const lower = input.filename.toLowerCase();
  await restoreSqlDump(input.buffer, { gzip: lower.endsWith(".sql.gz") });
  await recordAuditEvent({
    villageId,
    actorId: user.id,
    event: AUDIT_EVENTS.databaseRestore,
    resource: RESOURCES.database,
    resourceId: "restore",
    details: { aksi: "restore", namaBerkas: normalizeSqlFilename(input.filename) },
    ...getRequestContext(),
  });
}
