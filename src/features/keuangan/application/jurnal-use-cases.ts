import "server-only";

import { recordAuditEvent } from "@/features/audit/application/audit-use-cases";
import { AUDIT_EVENTS } from "@/features/audit/domain/audit";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { jurnalFormSchema, saldoBankFormSchema } from "@/features/keuangan/domain/jurnal";
import {
  formatMoney,
  KEUANGAN_RESOURCE,
  numberToMoney,
  toMinor,
} from "@/features/keuangan/domain/keuangan";
import {
  deleteJurnal,
  findJurnal,
  insertJurnal,
  listJurnal,
  listJurnalTahunTersedia,
  listSaldoBank,
  ringkasJurnal,
  upsertSaldoBank,
} from "@/features/keuangan/infrastructure/jurnal-repository";
import { requirePermission } from "@/lib/dal";
import { conflict, notFound } from "@/lib/errors";

/**
 * Use case jurnal pembukuan & saldo bank (OS-FIN-003).
 *
 * Izin diperiksa di sini agar aturan yang sama berlaku dari halaman maupun
 * Server Action. Semua query di-scope ke `village_id` sesi — bukan input klien.
 */

const TAHUN_MIN = 2000;
const TAHUN_MAX = 2100;

function isValidTahun(value: number): boolean {
  return Number.isInteger(value) && value >= TAHUN_MIN && value <= TAHUN_MAX;
}

/** Tahun terpilih: parameter valid, atau tahun terakhir yang punya data. */
function pilihTahun(tahunParam: number | undefined, tersedia: number[]): number {
  if (tahunParam !== undefined && isValidTahun(tahunParam)) return tahunParam;
  return tersedia.at(-1) ?? new Date().getFullYear();
}

/** Jurnal satu tahun beserta total debet/kredit, saldo, dan saldo bank. */
export async function getJurnalPembukuan(tahunParam?: number) {
  const user = await requirePermission(KEUANGAN_RESOURCE, "read");
  const villageId = await resolveVillageId(user);

  const tersedia = await listJurnalTahunTersedia(villageId);
  const tahun = pilihTahun(tahunParam, tersedia);

  const [rows, total, saldoBank] = await Promise.all([
    listJurnal(villageId, { tahun }),
    ringkasJurnal(villageId, tahun),
    listSaldoBank(villageId, tahun),
  ]);

  return {
    tahun,
    tersedia,
    rows,
    ringkas: {
      totalDebet: total.debet,
      totalKredit: total.kredit,
      saldo: formatMoney(toMinor(total.debet) - toMinor(total.kredit)),
      jumlah: total.jumlah,
    },
    saldoBank,
    totalSaldoAwal: formatMoney(saldoBank.reduce((acc, row) => acc + toMinor(row.saldoAwal), 0n)),
  };
}

/** Simpan satu mutasi jurnal manual (validasi di domain). */
export async function simpanJurnalPembukuanData(input: unknown): Promise<{ id: number }> {
  const user = await requirePermission(KEUANGAN_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  const parsed = jurnalFormSchema.safeParse(input);
  if (!parsed.success) {
    throw conflict(parsed.error.issues[0]?.message ?? "Isian jurnal tidak valid.");
  }
  const data = parsed.data;

  const id = await insertJurnal(
    villageId,
    {
      tahun: data.tahun,
      tanggal: data.tanggal,
      kodeRekening: data.kodeRekening,
      uraian: data.uraian,
      debet: numberToMoney(data.debet),
      kredit: numberToMoney(data.kredit),
      referensi: data.referensi ?? null,
    },
    user.id,
  );

  await recordAuditEvent({
    villageId,
    actorId: user.id,
    event: AUDIT_EVENTS.keuanganSave,
    resource: KEUANGAN_RESOURCE,
    resourceId: String(id),
    details: { jenis: "jurnal", tahun: data.tahun },
  });

  return { id };
}

/** Hapus satu entri jurnal milik desa sesi. */
export async function hapusJurnalPembukuanData(id: number): Promise<void> {
  const user = await requirePermission(KEUANGAN_RESOURCE, "delete");
  const villageId = await resolveVillageId(user);

  if (!Number.isInteger(id) || id < 1) throw notFound("Entri jurnal tidak ditemukan.");

  const existing = await findJurnal(villageId, id);
  if (!existing) throw notFound("Entri jurnal tidak ditemukan.");

  await deleteJurnal(villageId, id);

  await recordAuditEvent({
    villageId,
    actorId: user.id,
    event: AUDIT_EVENTS.keuanganSave,
    resource: KEUANGAN_RESOURCE,
    resourceId: String(id),
    details: { jenis: "jurnal-hapus" },
  });
}

/** Saldo awal rekening bank satu tahun beserta totalnya. */
export async function getSaldoBankPembukuan(tahunParam?: number) {
  const user = await requirePermission(KEUANGAN_RESOURCE, "read");
  const villageId = await resolveVillageId(user);

  const tersedia = await listJurnalTahunTersedia(villageId);
  const tahun = pilihTahun(tahunParam, tersedia);
  const rows = await listSaldoBank(villageId, tahun);

  return {
    tahun,
    tersedia,
    rows,
    total: formatMoney(rows.reduce((acc, row) => acc + toMinor(row.saldoAwal), 0n)),
  };
}

/** Simpan (upsert) saldo awal satu rekening bank. */
export async function simpanSaldoBankPembukuanData(
  input: unknown,
): Promise<{ tahun: number; rekeningBank: string }> {
  const user = await requirePermission(KEUANGAN_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  const parsed = saldoBankFormSchema.safeParse(input);
  if (!parsed.success) {
    throw conflict(parsed.error.issues[0]?.message ?? "Isian saldo bank tidak valid.");
  }
  const data = parsed.data;

  await upsertSaldoBank(villageId, {
    tahun: data.tahun,
    rekeningBank: data.rekeningBank,
    namaBank: data.namaBank,
    saldoAwal: numberToMoney(data.saldoAwal),
  });

  await recordAuditEvent({
    villageId,
    actorId: user.id,
    event: AUDIT_EVENTS.keuanganSave,
    resource: KEUANGAN_RESOURCE,
    resourceId: data.rekeningBank,
    details: { jenis: "saldo-bank", tahun: data.tahun },
  });

  return { tahun: data.tahun, rekeningBank: data.rekeningBank };
}
