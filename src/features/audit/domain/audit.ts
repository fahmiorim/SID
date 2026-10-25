export const AUDIT_EVENTS = {
  loginSuccess: "auth.login.success",
  loginFailure: "auth.login.failure",
  passwordResetRequest: "auth.password.reset.request",
  passwordResetSuccess: "auth.password.reset.success",
  databaseBackup: "database.backup",
  databaseRestore: "database.restore",
} as const;

export type AuditEvent = (typeof AUDIT_EVENTS)[keyof typeof AUDIT_EVENTS];

export const AUDIT_EVENT_LABELS: Record<AuditEvent, string> = {
  [AUDIT_EVENTS.loginSuccess]: "Login berhasil",
  [AUDIT_EVENTS.loginFailure]: "Login gagal",
  [AUDIT_EVENTS.passwordResetRequest]: "Permintaan reset sandi",
  [AUDIT_EVENTS.passwordResetSuccess]: "Reset sandi berhasil",
  [AUDIT_EVENTS.databaseBackup]: "Backup basis data",
  [AUDIT_EVENTS.databaseRestore]: "Restore basis data",
};

export interface AuditEventInput {
  villageId: number | null;
  actorId?: string | null;
  event: AuditEvent;
  resource: string;
  resourceId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  details?: Record<string, boolean | number | string | null>;
}

/** Serialisasi detail yang aman untuk disimpan tanpa memasukkan kredensial. */
export function serializeAuditDetails(details: AuditEventInput["details"]): string | null {
  if (!details || Object.keys(details).length === 0) return null;
  return JSON.stringify(details);
}

export interface AuditLogRow {
  id: number;
  villageId: number | null;
  actorId: string | null;
  actorName: string | null;
  event: string;
  resource: string;
  resourceId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  details: string | null;
  createdAt: Date;
}
