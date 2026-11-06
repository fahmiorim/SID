"use server";

import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";

import { errorState, successState, zodToFieldErrors, type ActionState } from "@/lib/action-state";
import { isAppError } from "@/lib/errors";

import {
  hapusDomain,
  jadikanDomainUtamaDesa,
  resetAksesAdminDesa,
  tambahDomain,
  ubahKuotaMedia,
  ubahStatusDesa,
  type HasilResetAdmin,
} from "../application/kelola-desa-use-cases";

type State<T> = ActionState<T | null>;

export async function ubahStatusDesaAction(
  _prev: State<{ active: boolean }>,
  formData: FormData,
): Promise<State<{ active: boolean }>> {
  try {
    const input = {
      villageId: formData.get("villageId"),
      active: formData.get("active"),
    };
    const hasil = await ubahStatusDesa(input);
    revalidatePath("/super-admin");

    return successState(
      hasil.active ? "Desa diaktifkan." : "Desa dinonaktifkan (arsip lunak).",
      hasil,
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Periksa kembali isian.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal mengubah status desa.");
  }
}

export async function ubahKuotaMediaAction(
  _prev: State<{ kuotaMediaMb: number | null }>,
  formData: FormData,
): Promise<State<{ kuotaMediaMb: number | null }>> {
  try {
    const input = {
      villageId: formData.get("villageId"),
      kuotaMediaMb: formData.get("kuotaMediaMb"),
    };
    const hasil = await ubahKuotaMedia(input);
    revalidatePath("/super-admin");

    return successState(
      hasil.kuotaMediaMb === null
        ? "Kuota media dihapus (tanpa batas)."
        : `Kuota media diatur ${hasil.kuotaMediaMb} MB.`,
      hasil,
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Periksa kembali isian.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal mengubah kuota media.");
  }
}

export async function tambahDomainAction(
  _prev: State<{ id: number }>,
  formData: FormData,
): Promise<State<{ id: number }>> {
  try {
    const input = {
      villageId: formData.get("villageId"),
      domain: formData.get("domain"),
    };
    const hasil = await tambahDomain(input);
    revalidatePath("/super-admin");

    return successState(`Domain ${formData.get("domain")} ditambahkan.`, hasil);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorState("Periksa kembali isian.", zodToFieldErrors(error as ZodError));
    }
    return errorState(isAppError(error) ? error.message : "Gagal menambahkan domain.");
  }
}

export async function hapusDomainAction(
  _prev: State<null>,
  formData: FormData,
): Promise<State<null>> {
  try {
    await hapusDomain({
      villageId: formData.get("villageId"),
      domainId: formData.get("domainId"),
    });
    revalidatePath("/super-admin");

    return successState("Domain dihapus.");
  } catch (error) {
    return errorState(isAppError(error) ? error.message : "Gagal menghapus domain.");
  }
}

export async function jadikanDomainUtamaAction(
  _prev: State<null>,
  formData: FormData,
): Promise<State<null>> {
  try {
    await jadikanDomainUtamaDesa({
      villageId: formData.get("villageId"),
      domainId: formData.get("domainId"),
    });
    revalidatePath("/super-admin");

    return successState("Domain utama diperbarui.");
  } catch (error) {
    return errorState(isAppError(error) ? error.message : "Gagal mengubah domain utama.");
  }
}

export async function resetAksesAdminAction(
  _prev: State<HasilResetAdmin>,
  formData: FormData,
): Promise<State<HasilResetAdmin>> {
  try {
    const hasil = await resetAksesAdminDesa({ villageId: formData.get("villageId") });
    revalidatePath("/super-admin");

    return successState(
      `Sandi sementara: ${hasil.sandiSementara}. Sampaikan ke administrator desa.`,
      hasil,
      "warning",
    );
  } catch (error) {
    return errorState(isAppError(error) ? error.message : "Gagal reset akses admin.");
  }
}
