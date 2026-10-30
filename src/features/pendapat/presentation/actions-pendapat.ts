"use server";

import { createHash } from "crypto";
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
import {
  errorState,
  successState,
  toErrorState,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/action-state";
import { verifySession } from "@/lib/dal";

function generateSessionKey(residentId: number | null, ipAddress: string): string {
  const key = `${residentId ?? "anon"}:${ipAddress}`;
  return createHash("sha256").update(key).digest("hex").slice(0, 64);
}

/** Kesalahan MySQL untuk pelanggaran indeks unik. */
function isDuplicate(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: string }).code === "ER_DUP_ENTRY"
  );
}

export async function submitPendapatPublikAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
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
    return errorState("Periksa kembali pilihan Anda.", zodToFieldErrors(parsed.error));
  }

  const sessionKey = generateSessionKey(parsed.data.residentId ?? null, ipAddress);

  try {
    await createPendapat({
      villageId,
      residentId: parsed.data.residentId ?? null,
      sessionKey,
      pengguna: parsed.data.pengguna || null,
      pilihan: parsed.data.pilihan,
      ipAddress: parsed.data.ipAddress || null,
    });
    revalidatePath("/jajak-pendapat");
    revalidatePath("/beranda");
    return successState("Terima kasih, pendapat Anda sudah tercatat.");
  } catch (error) {
    if (isDuplicate(error)) {
      return errorState("Anda sudah pernah mengirimkan pendapat untuk sesi ini.");
    }
    return toErrorState(error);
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
