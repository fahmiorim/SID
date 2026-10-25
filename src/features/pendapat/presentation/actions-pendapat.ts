"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import {
  getIdentitasFromRequest,
  resolveVillageId,
} from "@/features/desa/application/resolve-village";
import { PENDAPAT_RESOURCE, pendapatSchema } from "@/features/pendapat/domain/pendapat";
import {
  createPendapat,
  deletePendapat,
} from "@/features/pendapat/infrastructure/pendapat-repository";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export async function submitPendapatPublikAction(formData: FormData): Promise<void> {
  const desa = await getIdentitasFromRequest();
  const villageId = desa.id;
  const h = await headers();
  const ipAddress = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "";

  const raw = {
    villageId,
    residentId: formData.get("residentId") ? Number(formData.get("residentId")) : null,
    pengguna: formData.get("pengguna") ? String(formData.get("pengguna")) : "",
    pilihan: Number(formData.get("pilihan")),
    ipAddress,
  };

  const parsed = pendapatSchema.safeParse(raw);
  if (!parsed.success) {
    return;
  }

  try {
    await createPendapat({
      villageId,
      residentId: parsed.data.residentId ?? null,
      pengguna: parsed.data.pengguna || null,
      pilihan: parsed.data.pilihan,
      ipAddress: parsed.data.ipAddress || null,
    });
    revalidatePath("/jajak-pendapat");
    revalidatePath("/beranda");
  } catch {
    // ignore
  }
}
export async function deletePendapatAction(id: number) {
  const user = await verifySession();
  if (!hasPermission(user.permissions, PENDAPAT_RESOURCE, "delete")) {
    return { ok: false, message: "Tidak memiliki izin." };
  }
  const villageId = await resolveVillageId(user);
  try {
    await deletePendapat(id, villageId);
    revalidatePath("/pendapat");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Gagal menghapus pendapat." };
  }
}
