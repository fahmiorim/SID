"use server";

import { revalidatePath } from "next/cache";

import { ubahStatusUmpanBalik } from "@/features/umpan-balik/application/umpan-balik-use-cases";
import { ubahStatusUmpanBalikSchema } from "@/features/umpan-balik/domain/umpan-balik";

/** Ubah status tindak lanjut dari tabel admin (form action). */
export async function ubahStatusUmpanBalikFormAction(formData: FormData): Promise<void> {
  const parsed = ubahStatusUmpanBalikSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });

  if (!parsed.success) throw new Error("Data status umpan balik tidak valid.");

  await ubahStatusUmpanBalik(parsed.data.id, parsed.data.status);
  revalidatePath("/umpan-balik");
}
