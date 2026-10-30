import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { perangkatDesa } from "@/db/schema/content";
import { requirePermission } from "@/lib/dal";
import { AppError } from "@/lib/errors";

import { KEHADIRAN_RESOURCE, kehadiranFormSchema } from "../domain/kehadiran";
import {
  createKehadiran,
  deleteKehadiran,
  listKehadiran,
  updateKehadiran,
} from "../infrastructure/kehadiran-repository";

export async function daftarKehadiran(
  villageId: number,
  opts?: { bulan?: number; tahun?: number; perangkatId?: number },
) {
  await requirePermission(KEHADIRAN_RESOURCE, "read");
  const items = await listKehadiran(villageId, opts);
  const perangkatList = await db
    .select()
    .from(perangkatDesa)
    .where(eq(perangkatDesa.villageId, villageId));
  const perangkatMap = new Map(perangkatList.map((p) => [p.id, p]));

  return items.map((item) => ({
    ...item,
    tanggal: String(item.tanggal),
    perangkatNama: perangkatMap.get(item.perangkatId ?? 0)?.nama ?? "-",
    perangkatJabatan: perangkatMap.get(item.perangkatId ?? 0)?.jabatanId?.toString() ?? "-",
    status: (item.status as "hadir" | "izin" | "sakit" | "alpa") ?? "hadir",
  }));
}

export async function tambahKehadiran(villageId: number, input: unknown) {
  await requirePermission(KEHADIRAN_RESOURCE, "update");
  const parsed = kehadiranFormSchema.parse(input);
  return await createKehadiran({
    villageId,
    perangkatId: parsed.perangkatId,
    tanggal: new Date(parsed.tanggal),
    jamMasuk: parsed.jamMasuk ?? null,
    jamKeluar: parsed.jamKeluar ?? null,
    status: parsed.status,
  });
}

export async function ubahKehadiran(villageId: number, id: number, input: unknown) {
  await requirePermission(KEHADIRAN_RESOURCE, "update");
  const parsed = kehadiranFormSchema.parse(input);
  await updateKehadiran(id, villageId, {
    perangkatId: parsed.perangkatId,
    tanggal: new Date(parsed.tanggal),
    jamMasuk: parsed.jamMasuk ?? null,
    jamKeluar: parsed.jamKeluar ?? null,
    status: parsed.status,
  });
}

export async function hapusKehadiran(villageId: number, id: number) {
  await requirePermission(KEHADIRAN_RESOURCE, "delete");
  if (!id || id < 1) throw new AppError("NOT_FOUND", "ID tidak valid.");
  await deleteKehadiran(id, villageId);
}
