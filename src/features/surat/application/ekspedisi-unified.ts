/**
 * Ekspedisi Terpadu Service — Application layer
 *
 * Menyediakan fungsi untuk catat ekspedisi lintas modul, dengan
 * dukungan lampiran & audit trail detail.
 */

import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { suratAuditTrail, unifiedShipments } from "@/db/schema";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { getMediaSettings } from "@/features/kebijakan-berkas/domain/pengaturan-berkas";
import { simpanBerkasMedia } from "@/features/publik/application/simpan-berkas-media";
import type { BerkasUnggahan } from "@/features/publik/domain/media";
import { hapusMedia } from "@/features/publik/infrastructure/media-storage";
import { requirePermission } from "@/lib/dal";
import { notFound, validationError } from "@/lib/errors";

import {
  buatAuditEntries,
  deteksiPerubahan,
  ekspedisiUnifiedSchema,
  type EkspedisiUnifiedInput,
} from "../domain/ekspedisi-unified";
import {
  parseLampiran,
  serializeLampiran,
  validasiJumlahLampiranDenganPengaturan,
  validasiUnggahanLampiranDenganPengaturan,
} from "../domain/lampiran-surat";

/** List ekspedisi untuk modul & id sumber. */
export async function listEkspedisiUnified(
  villageId: number,
  sourceModule: string,
  sourceId: number,
) {
  const rows = await db
    .select()
    .from(unifiedShipments)
    .where(
      and(
        eq(unifiedShipments.villageId, villageId),
        eq(unifiedShipments.sourceModule, sourceModule),
        eq(unifiedShipments.sourceId, sourceId),
      ),
    )
    .orderBy(unifiedShipments.createdAt);

  return rows.map((r) => ({
    ...r,
    lampiran: r.lampiran ? JSON.parse(r.lampiran) : [],
  }));
}

/** Catat ekspedisi terpadu dengan lampiran & audit trail. */
export async function catatEkspedisiUnified(
  input: EkspedisiUnifiedInput,
  lampiranBerkas?: BerkasUnggahan[],
  actorId?: string,
  actorVillageId?: number,
) {
  const user = await requirePermission("surat", "update");
  const villageId = actorVillageId ?? (await resolveVillageId(user));

  const parsed = ekspedisiUnifiedSchema.safeParse(input);
  if (!parsed.success) throw validationError("Input tidak valid.");

  // Ambil pengaturan lampiran untuk kategori "surat"
  const pengaturan = await getMediaSettings(villageId, "surat");

  // Validasi lampiran
  const lampiranItems: Array<{ path: string; name: string; mime: string; size: number }> = [];
  if (lampiranBerkas && lampiranBerkas.length > 0) {
    const errJumlah = validasiJumlahLampiranDenganPengaturan(pengaturan, lampiranBerkas.length);
    if (errJumlah) throw validationError(errJumlah);
    for (const berkas of lampiranBerkas) {
      const err = validasiUnggahanLampiranDenganPengaturan(pengaturan, berkas.mime, berkas.ukuran);
      if (err) throw validationError(err);
      const jalur = await simpanBerkasMedia(villageId, berkas, "umum", "lampiran");
      lampiranItems.push({
        path: jalur,
        name: berkas.nama,
        mime: berkas.mime ?? "application/octet-stream",
        size: berkas.ukuran,
      });
    }
  }

  const lampiranJson = serializeLampiran(lampiranItems);

  const [inserted] = await db
    .insert(unifiedShipments)
    .values({
      villageId,
      sourceModule: input.sourceModule,
      sourceId: input.sourceId,
      sentDate: input.sentDate,
      recipient: input.recipient ?? null,
      deliveryMethod: input.deliveryMethod ?? null,
      trackingNo: input.trackingNo ?? null,
      note: input.note ?? null,
      lampiran: lampiranJson,
      createdBy: actorId ?? user.id,
    })
    .$returningId();

  const row = inserted;
  if (!row) throw new Error("Gagal membuat ekspedisi.");
  // Audit trail create
  const auditEntries = buatAuditEntries(
    villageId,
    "unified_shipment",
    row.id,
    [{ field: "all", oldValue: null, newValue: input }],
    actorId ?? user.id,
    "create",
  );
  if (auditEntries.length) {
    await db.insert(suratAuditTrail).values(auditEntries);
  }

  return { id: row.id };
}

/** Hapus lampiran individual dari ekspedisi. */
export async function hapusLampiranEkspedisi(villageId: number, shipmentId: number, index: number) {
  const user = await requirePermission("surat", "update");
  const row = await db
    .select()
    .from(unifiedShipments)
    .where(and(eq(unifiedShipments.id, shipmentId), eq(unifiedShipments.villageId, villageId)))
    .then((rows) => rows[0]);

  if (!row) throw notFound("Ekspedisi tidak ditemukan.");

  const lampiran = parseLampiran(row.lampiran);
  if (!lampiran[index]) throw notFound("Lampiran tidak ditemukan.");

  // Hapus file fisik
  await hapusMedia(lampiran[index].path);

  // Hapus dari array
  const baru = lampiran.filter((_item: unknown, i: number) => i !== index);
  const lampiranJson = serializeLampiran(baru);

  await db
    .update(unifiedShipments)
    .set({ lampiran: lampiranJson })
    .where(eq(unifiedShipments.id, shipmentId));

  // Audit
  await db.insert(suratAuditTrail).values({
    villageId,
    entityType: "unified_shipment",
    entityId: shipmentId,
    fieldName: "lampiran",
    oldValue: JSON.stringify(lampiran[index]),
    newValue: null,
    actorId: user.id,
    action: "attachment_remove",
  });

  return { ok: true };
}

/** Update ekspedisi (dengan deteksi perubahan field). */
export async function updateEkspedisiUnified(
  villageId: number,
  shipmentId: number,
  input: Partial<EkspedisiUnifiedInput>,
) {
  const user = await requirePermission("surat", "update");
  const row = await db
    .select()
    .from(unifiedShipments)
    .where(and(eq(unifiedShipments.id, shipmentId), eq(unifiedShipments.villageId, villageId)))
    .then((rows) => rows[0]);

  if (!row) throw notFound("Ekspedisi tidak ditemukan.");

  // Cek perubahan
  const before = {
    sentDate: row.sentDate,
    recipient: row.recipient,
    deliveryMethod: row.deliveryMethod,
    trackingNo: row.trackingNo,
    note: row.note,
  };
  const after = { ...before, ...input };

  const changes = deteksiPerubahan(before, after, [
    "sentDate",
    "recipient",
    "deliveryMethod",
    "trackingNo",
    "note",
  ]);

  await db
    .update(unifiedShipments)
    .set({
      sentDate: input.sentDate ?? row.sentDate,
      recipient: input.recipient ?? row.recipient,
      deliveryMethod: input.deliveryMethod ?? row.deliveryMethod,
      trackingNo: input.trackingNo ?? row.trackingNo,
      note: input.note ?? row.note,
      updatedAt: new Date(),
    })
    .where(eq(unifiedShipments.id, shipmentId));

  // Audit trail update
  if (changes.length) {
    const entries = buatAuditEntries(
      villageId,
      "unified_shipment",
      shipmentId,
      changes,
      user.id,
      "update",
    );
    await db.insert(suratAuditTrail).values(entries);
  }

  return { ok: true };
}
