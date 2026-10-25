import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { keuanganTransaksi } from "@/db/schema";

// --- Catatan transaksi manual ---

export async function listKeuanganTransaksi(villageId: number, jenis?: "pendapatan" | "belanja") {
  const j = jenis ?? "pendapatan"; // default filter

  return db
    .select({
      id: keuanganTransaksi.id,
      templateUuid: keuanganTransaksi.templateUuid,
      keterangan: keuanganTransaksi.keterangan,
      jumlah: keuanganTransaksi.jumlah,
      tanggal: keuanganTransaksi.tanggal,
      createdBy: keuanganTransaksi.createdBy,
    })
    .from(keuanganTransaksi)
    .where(and(eq(keuanganTransaksi.villageId, villageId), eq(keuanganTransaksi.jenis, j)));
}

export async function saveKeuanganTransaksi(
  villageId: number,
  inputs: Array<{
    keterangan: string;
    jumlah: string;
    jenis: "pendapatan" | "belanja";
    templateUuid?: string;
  }>,
  createdBy: string,
): Promise<void> {
  const toWrite = inputs.map((input) => ({
    villageId,
    templateUuid: input.templateUuid ?? null,
    keterangan: input.keterangan,
    jumlah: input.jumlah,
    jenis: input.jenis,
    createdBy,
  }));

  await db.insert(keuanganTransaksi).values(toWrite);
}

export async function deleteKeuanganTransaksi(villageId: number, id: number): Promise<void> {
  await db
    .delete(keuanganTransaksi)
    .where(and(eq(keuanganTransaksi.id, id), eq(keuanganTransaksi.villageId, villageId)));
}
