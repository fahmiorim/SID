"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import type { BerkasUnggahan } from "@/features/publik/domain/media";
import { errorState, successState, toErrorState, type ActionState } from "@/lib/action-state";
import { notFound } from "@/lib/errors";

import { cariPerangkatKiosk } from "../application/anjungan-use-cases";
import {
  ajukanSuratKioskData,
  bacaSesiGuestKioskData,
  bukaSesiGuestKioskData,
} from "../application/kiosk-use-cases";
import { KIOSK_GUEST_COOKIE, KIOSK_GUEST_TTL_MS } from "../domain/kiosk-guest";
import { ANJUNGAN_UUID_COOKIE } from "./device-uuid";

const JALUR_KIOSK = "/desa/anjungan";
const JALUR_PERMOHONAN = "/desa/anjungan/permohonan";

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function isFile(value: FormDataEntryValue | null): value is File {
  return Boolean(
    value &&
    typeof value === "object" &&
    "arrayBuffer" in value &&
    typeof (value as File).arrayBuffer === "function",
  );
}

async function bacaBerkas(formData: FormData, field: string): Promise<BerkasUnggahan | null> {
  const value = formData.get(field);
  if (!isFile(value) || value.size === 0) return null;

  return {
    nama: value.name,
    mime: value.type || null,
    ukuran: value.size,
    isi: new Uint8Array(await value.arrayBuffer()),
  };
}

/** Konteks kiosk: desa dari host, perangkat dari cookie UUID browser kiosk. */
async function konteksKiosk() {
  const identitas = await getIdentitasFromRequest();
  const villageId = identitas?.id;
  if (!villageId) notFound();

  const cookieStore = await cookies();
  const perangkat = await cariPerangkatKiosk(
    villageId,
    cookieStore.get(ANJUNGAN_UUID_COOKIE)?.value,
  );

  return { villageId, perangkat, cookieStore };
}

/**
 * Verifikasi NIK + tanggal lahir untuk sesi guest kiosk.
 *
 * Berhasil → cookie sesi bertanda tangan dipasang lalu kembali ke daftar surat.
 */
export async function verifikasiKioskAction(
  _previousState: ActionState<{ nama: string } | null>,
  formData: FormData,
): Promise<ActionState<{ nama: string } | null>> {
  try {
    const { villageId, perangkat, cookieStore } = await konteksKiosk();
    if (!perangkat) notFound();

    const { token } = await bukaSesiGuestKioskData(villageId, perangkat, {
      nik: text(formData, "nik"),
      tanggalLahir: text(formData, "tanggalLahir"),
    });

    cookieStore.set(KIOSK_GUEST_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: JALUR_KIOSK,
      maxAge: Math.floor(KIOSK_GUEST_TTL_MS / 1000),
    });
  } catch (error) {
    return toErrorState(error);
  }

  revalidatePath(JALUR_PERMOHONAN);
  redirect(JALUR_PERMOHONAN);
}

/** Akhiri sesi guest kiosk dan kembali ke beranda anjungan. */
export async function keluarKioskAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete({ name: KIOSK_GUEST_COOKIE, path: JALUR_KIOSK });
  revalidatePath(JALUR_PERMOHONAN);
  redirect(JALUR_KIOSK);
}

/** Ajukan surat dari layar kiosk memakai sesi guest. */
export async function ajukanSuratKioskAction(
  _previousState: ActionState<{ id: number; noAntrian: string } | null>,
  formData: FormData,
): Promise<ActionState<{ id: number; noAntrian: string } | null>> {
  const letterTypeId = Number(formData.get("letterTypeId"));
  if (!Number.isInteger(letterTypeId) || letterTypeId < 1) {
    return errorState("Jenis surat tidak valid.");
  }

  const isian: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("isian.") || typeof value !== "string") continue;
    isian[key.slice("isian.".length)] = value;
  }

  const berkas = new Map<number, BerkasUnggahan>();
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("syarat.") || !isFile(value)) continue;
    const id = Number(key.slice("syarat.".length));
    if (!Number.isInteger(id) || id < 1) continue;
    const item = await bacaBerkas(formData, key);
    if (item) berkas.set(id, item);
  }

  try {
    const { villageId, perangkat, cookieStore } = await konteksKiosk();
    if (!perangkat) notFound();

    const sesi = await bacaSesiGuestKioskData(
      villageId,
      perangkat,
      cookieStore.get(KIOSK_GUEST_COOKIE)?.value,
    );

    const hasil = await ajukanSuratKioskData(villageId, perangkat, sesi, {
      letterTypeId,
      isian,
      noHpAktif: text(formData, "noHpAktif"),
      keterangan: text(formData, "keterangan"),
      berkas,
    });

    revalidatePath(JALUR_PERMOHONAN);
    return successState(`Permohonan terkirim. Nomor antrian: ${hasil.noAntrian}.`, hasil);
  } catch (error) {
    return toErrorState(error);
  }
}
