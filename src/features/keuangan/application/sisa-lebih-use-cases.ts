import "server-only";

import { requirePermission } from "@/lib/dal";
import { AppError } from "@/lib/errors";

import { formatMoney, toMinor } from "../domain/keuangan";
import {
  normalisasiJumlahSisaLebih,
  SISA_LEBIH_KODE_REKENING,
  SISA_LEBIH_RESOURCE,
  sisaLebihFormSchema,
} from "../domain/sisa-lebih";
import { saveKeuanganNilai } from "../infrastructure/keuangan-repository";
import {
  createSisaLebih,
  deleteSisaLebih,
  getSisaLebih,
  listSisaLebih,
  listSisaLebihTahun,
  updateSisaLebih,
} from "../infrastructure/sisa-lebih-repository";

export async function daftarSisaLebih(villageId: number) {
  await requirePermission(SISA_LEBIH_RESOURCE, "read");
  const items = await listSisaLebih(villageId);
  return items.map((item) => {
    const t = item.tanggal as unknown;
    let tanggalVal: string | null = null;
    if (t instanceof Date) {
      tanggalVal = t.toISOString().split("T")[0] ?? null;
    } else if (typeof t === "string" && (t as string).length > 0) {
      tanggalVal = t as string;
    }

    return {
      id: Number(item.id),
      villageId: Number(item.villageId),
      tahun: Number(item.tahun),
      jumlah: item.jumlah == null ? null : normalisasiJumlahSisaLebih(String(item.jumlah)),
      keterangan: item.keterangan == null ? null : String(item.keterangan),
      tanggal: tanggalVal,
    };
  });
}

/**
 * Jumlahkan seluruh catatan SiLPA satu tahun lalu tulis ke rekening 6.1.1
 * APBDes tahun yang sama.
 *
 * SiLPA adalah penerimaan pembiayaan tahun berikutnya; menyimpannya di tabel
 * terpisah saja membuat APBDes dan laporan resmi tidak pernah menerima angka
 * tersebut. Penulisan memakai agregasi yang sama dengan penyimpanan APBDes,
 * sehingga induk 6.1/6 ikut diperbarui.
 */
async function sinkronKeApbdes(villageId: number, tahun: number, createdBy: string) {
  const rows = await listSisaLebihTahun(villageId, tahun);
  const total = formatMoney(
    rows.reduce((acc, row) => {
      const jumlah = row.jumlah ? normalisasiJumlahSisaLebih(row.jumlah) : null;
      return acc + (jumlah ? toMinor(jumlah) : 0n);
    }, 0n),
  );

  await saveKeuanganNilai(villageId, tahun, createdBy, [
    { templateUuid: SISA_LEBIH_KODE_REKENING, anggaran: total, realisasi: "0.00" },
  ]);
}

export async function tambahSisaLebih(villageId: number, input: unknown) {
  const user = await requirePermission(SISA_LEBIH_RESOURCE, "update");
  const parsed = sisaLebihFormSchema.parse(input);
  const result = await createSisaLebih({
    villageId,
    tahun: parsed.tahun,
    jumlah: parsed.jumlah,
    keterangan: parsed.keterangan ?? null,
    tanggal: parsed.tanggal ? new Date(parsed.tanggal) : null,
  });
  await sinkronKeApbdes(villageId, parsed.tahun, user.id);
  return { id: result };
}

export async function ubahSisaLebih(villageId: number, id: number, input: unknown) {
  const user = await requirePermission(SISA_LEBIH_RESOURCE, "update");
  const parsed = sisaLebihFormSchema.parse(input);
  const existing = await getSisaLebih(villageId, id);
  if (!existing) throw new AppError("NOT_FOUND", "Data SiLPA tidak ditemukan.");

  await updateSisaLebih(id, villageId, {
    tahun: parsed.tahun,
    jumlah: parsed.jumlah,
    keterangan: parsed.keterangan ?? null,
    tanggal: parsed.tanggal ? new Date(parsed.tanggal) : null,
  });

  await sinkronKeApbdes(villageId, existing.tahun, user.id);
  if (parsed.tahun !== existing.tahun) {
    await sinkronKeApbdes(villageId, parsed.tahun, user.id);
  }
}

export async function hapusSisaLebih(villageId: number, id: number) {
  const user = await requirePermission(SISA_LEBIH_RESOURCE, "delete");
  if (!id || id < 1) throw new AppError("NOT_FOUND", "ID tidak valid.");
  const existing = await getSisaLebih(villageId, id);
  if (!existing) throw new AppError("NOT_FOUND", "Data SiLPA tidak ditemukan.");

  await deleteSisaLebih(id, villageId);
  await sinkronKeApbdes(villageId, existing.tahun, user.id);
}
