/**
 * Ekspedisi Terpadu (lintas modul) — Domain
 *
 * Menyediakan types & validasi untuk pencatatan ekspedisi bersama
 * (`unified_shipments`). Digunakan oleh modul surat, pengaduan, bimtek, dll.
 */

import { z } from "zod";

import { encodeAuditValue } from "./lampiran-surat";

/** Skema input untuk ekspedisi terpadu. */
export const ekspedisiUnifiedSchema = z.object({
  sourceModule: z.enum(["surat_masuk", "surat_keluar", "surat_dinas", "pengaduan", "bimtek"]),
  sourceId: z.number().int().positive(),
  sentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal kirim tidak valid."),
  recipient: z.string().max(150).optional(),
  deliveryMethod: z.string().max(50).optional(),
  trackingNo: z.string().max(50).optional(),
  note: z.string().max(255).optional(),
  lampiran: z
    .array(
      z.object({
        path: z.string().min(1).max(500),
        name: z.string().min(1).max(255),
        mime: z.string().min(1).max(100),
        size: z.number().int().positive(),
      }),
    )
    .max(5)
    .optional()
    .default([]),
});

export type EkspedisiUnifiedInput = z.infer<typeof ekspedisiUnifiedSchema>;

/** DTO respons ekspedisi terpadu. */
export interface EkspedisiUnifiedRow {
  id: number;
  villageId: number;
  sourceModule: string;
  sourceId: number;
  sentDate: string;
  recipient: string | null;
  deliveryMethod: string | null;
  trackingNo: string | null;
  note: string | null;
  lampiran: string | null; // JSON array
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Validasi berubah field (untuk audit trail detail).
 *
 * Mengembalikan daftar perubahan field yang memiliki nilai
 * berbeda antara `before` dan `after`.
 */
export function deteksiPerubahan(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  fieldWhitelist?: string[],
): Array<{ field: string; oldValue: unknown; newValue: unknown }> {
  const changes: Array<{ field: string; oldValue: unknown; newValue: unknown }> = [];
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    if (fieldWhitelist && !fieldWhitelist.includes(key)) continue;
    const oldVal = before[key];
    const newVal = after[key];
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes.push({ field: key, oldValue: oldVal, newValue: newVal });
    }
  }
  return changes;
}

/**
 * Catat audit trail detail per field.
 *
 * Digunakan oleh use case surat untuk merekam perubahan rinci
 * disposisi/ekspedisi/data surat.
 */
export interface AuditTrailEntry {
  villageId: number;
  entityType: string;
  entityId: number;
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
  actorId: string | null;
  action: "create" | "update" | "delete" | "attachment_add" | "attachment_remove";
}

/**
 * Buat entri audit trail dari deteksi perubahan.
 */
export function buatAuditEntries(
  villageId: number,
  entityType: string,
  entityId: number,
  changes: Array<{ field: string; oldValue: unknown; newValue: unknown }>,
  actorId: string | null,
  action: "create" | "update" | "delete" | "attachment_add" | "attachment_remove",
): AuditTrailEntry[] {
  return changes.map((c) => ({
    villageId,
    entityType,
    entityId,
    fieldName: c.field,
    oldValue: encodeAuditValue(c.oldValue),
    newValue: encodeAuditValue(c.newValue),
    actorId,
    action,
  }));
}
