import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import { KEUANGAN_RESOURCE } from "@/features/keuangan/domain/keuangan";
import {
  hitungRingkasPembukuan,
  isoKeTanggalLokal,
  pembukuanFormSchema,
  tanggalIsoLokal,
  urutkanPembukuan,
  type PembukuanBaris,
} from "@/features/keuangan/domain/pembukuan";
import {
  deleteKeuanganTransaksi,
  findKeuanganTransaksi,
  listKeuanganTransaksi,
  saveKeuanganTransaksi,
} from "@/features/keuangan/infrastructure/keuangan-transaksi-repository";
import { requirePermission } from "@/lib/dal";
import { conflict, notFound } from "@/lib/errors";

/**
 * Use case pembukuan manual kas desa (OS-FIN-003).
 *
 * Izin diperiksa di sini agar aturan yang sama berlaku dari halaman maupun
 * Server Action. Semua query di-scope ke `village_id` sesi.
 */

function keBaris(row: {
  id: number;
  tanggal: Date;
  keterangan: string;
  jumlah: string;
  jenis: PembukuanBaris["jenis"];
}): PembukuanBaris {
  return {
    id: row.id,
    tanggal: tanggalIsoLokal(row.tanggal),
    keterangan: row.keterangan,
    jumlah: row.jumlah,
    jenis: row.jenis,
  };
}

/** Seluruh transaksi manual desa beserta ringkasan pendapatan/belanja/saldo. */
export async function getPembukuanData() {
  const user = await requirePermission(KEUANGAN_RESOURCE, "read");
  const villageId = await resolveVillageId(user);

  const rows = urutkanPembukuan((await listKeuanganTransaksi(villageId)).map(keBaris));

  return { rows, ringkas: hitungRingkasPembukuan(rows) };
}

/** Simpan satu transaksi manual baru (validasi terjadi di domain). */
export async function simpanTransaksiPembukuanData(input: unknown): Promise<{ id?: number }> {
  const user = await requirePermission(KEUANGAN_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  const parsed = pembukuanFormSchema.safeParse(input);
  if (!parsed.success) {
    throw conflict(parsed.error.issues[0]?.message ?? "Isian transaksi tidak valid.");
  }

  await saveKeuanganTransaksi(
    villageId,
    {
      tanggal: isoKeTanggalLokal(parsed.data.tanggal),
      keterangan: parsed.data.keterangan,
      jumlah: parsed.data.jumlah.toFixed(2),
      jenis: parsed.data.jenis,
    },
    user.id,
  );

  return {};
}

/** Hapus satu transaksi manual milik desa sesi. */
export async function hapusTransaksiPembukuanData(id: number): Promise<void> {
  const user = await requirePermission(KEUANGAN_RESOURCE, "delete");
  const villageId = await resolveVillageId(user);

  const existing = await findKeuanganTransaksi(villageId, id);
  if (!existing) throw notFound("Transaksi tidak ditemukan.");

  await deleteKeuanganTransaksi(villageId, id);
}
