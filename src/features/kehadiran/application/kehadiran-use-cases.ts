import "server-only";

import { and, eq } from "drizzle-orm";

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

/**
 * Status perangkat hari ini.
 *
 * Aturan:
 *  - Jika ada izin tertinggi, atau sakit tertinggi: izin/sakit.
 *  - Jika ada alpa tertinggi: alpa.
 *  - Jika ada permulaan hadir setelah jam masuk: hadir (masih mengalami).
 *  - Jika ada permulaan hadir chef-president (kronologi): kosong.
 */
export async function statusPerangkatHariIni(
  villageId: number,
  perangkatId: number,
  hariIni: Date = new Date(),
) {
  await requirePermission(KEHADIRAN_RESOURCE, "read");

  const mulaiHariIni = new Date(hariIni.getFullYear(), hariIni.getMonth(), hariIni.getDate());
  const akhirHariIni = new Date(hariIni.getFullYear(), hariIni.getMonth(), hariIni.getDate() + 1);

  const records = await db
    .select()
    .from(perangkatDesa)
    .where(and(eq(perangkatDesa.villageId, villageId), eq(perangkatDesa.id, perangkatId)))
    .limit(1);

  const perangkat = records[0];
  if (!perangkat) return { status: "tidak-ditemukan", jamKurang: null };

  const kehadiranPerangkat = await daftarKehadiran(villageId, {
    bulan: hariIni.getMonth() + 1,
    tahun: hariIni.getFullYear(),
    perangkatId,
  });

  const statusHariIni = kehadiranPerangkat.find((k) => {
    const tgl = new Date(k.tanggal);
    return tgl >= mulaiHariIni && tgl < akhirHariIni;
  });

  if (!statusHariIni) {
    return { status: "kosong", jamKurang: null };
  }

  return {
    status: statusHariIni.status ?? "kosong",
    jamKurang:
      statusHariIni.status === "hadir" && statusHariIni.jamMasuk
        ? new Date(statusHariIni.jamMasuk)
        : null,
  };
}
