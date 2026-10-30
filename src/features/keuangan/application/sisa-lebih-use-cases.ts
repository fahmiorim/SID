import "server-only";

import { requirePermission } from "@/lib/dal";
import { AppError } from "@/lib/errors";

import { SISA_LEBIH_RESOURCE, sisaLebihFormSchema } from "../domain/sisa-lebih";
import {
  createSisaLebih,
  deleteSisaLebih,
  listSisaLebih,
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
      jumlah: item.jumlah == null ? null : String(item.jumlah),
      keterangan: item.keterangan == null ? null : String(item.keterangan),
      tanggal: tanggalVal,
    };
  });
}

export async function tambahSisaLebih(villageId: number, input: unknown) {
  await requirePermission(SISA_LEBIH_RESOURCE, "update");
  const parsed = sisaLebihFormSchema.parse(input);
  const result = await createSisaLebih({
    villageId,
    tahun: parsed.tahun,
    jumlah: parsed.jumlah,
    keterangan: parsed.keterangan ?? null,
    tanggal: parsed.tanggal ? new Date(parsed.tanggal) : null,
  });
  return { id: result };
}

export async function ubahSisaLebih(villageId: number, id: number, input: unknown) {
  await requirePermission(SISA_LEBIH_RESOURCE, "update");
  const parsed = sisaLebihFormSchema.parse(input);
  await updateSisaLebih(id, villageId, {
    tahun: parsed.tahun,
    jumlah: parsed.jumlah,
    keterangan: parsed.keterangan ?? null,
    tanggal: parsed.tanggal ? new Date(parsed.tanggal) : null,
  });
}

export async function hapusSisaLebih(villageId: number, id: number) {
  await requirePermission(SISA_LEBIH_RESOURCE, "delete");
  if (!id || id < 1) throw new AppError("NOT_FOUND", "ID tidak valid.");
  await deleteSisaLebih(id, villageId);
}
