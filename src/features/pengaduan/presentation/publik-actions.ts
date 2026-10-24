"use server";

import { revalidatePath } from "next/cache";

import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import {
  kirimPengaduanData,
  simpanLampiranPengaduan,
} from "@/features/pengaduan/application/kirim-pengaduan";
import { pengaduanFormSchema } from "@/features/pengaduan/domain/pengaduan";
import type { BerkasUnggahan } from "@/features/publik/domain/media";
import {
  errorState,
  successState,
  toErrorState,
  zodToFieldErrors,
  type ActionState,
} from "@/lib/action-state";

const PATH_PUBLIK = "/desa/pengaduan";

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

async function ambilBerkas(formData: FormData, name: string): Promise<BerkasUnggahan | null> {
  const value = formData.get(name);
  if (!(value instanceof File) || value.size === 0) return null;

  return {
    nama: value.name,
    mime: value.type || null,
    ukuran: value.size,
    isi: new Uint8Array(await value.arrayBuffer()),
  };
}

/**
 * Kirim pengaduan dari halaman publik.
 *
 * Pengirim tidak perlu masuk; desa ditentukan dari host permintaan. Nomor tiket
 * dikembalikan pada `data` agar warga dapat menyimpannya untuk melacak status.
 */
export async function kirimPengaduanAction(
  _previousState: ActionState<string | null>,
  formData: FormData,
): Promise<ActionState<string | null>> {
  const parsed = pengaduanFormSchema.safeParse({
    kategori: text(formData, "kategori"),
    judul: text(formData, "judul"),
    isi: text(formData, "isi"),
    namaPelapor: text(formData, "namaPelapor"),
    nik: text(formData, "nik"),
    telepon: text(formData, "telepon"),
    email: text(formData, "email"),
    alamat: text(formData, "alamat"),
  });

  if (!parsed.success) {
    return errorState("Periksa kembali isian pengaduan.", zodToFieldErrors(parsed.error));
  }

  try {
    const desa = await getIdentitasFromRequest();
    const berkas = await ambilBerkas(formData, "lampiran");
    const lampiran = berkas ? await simpanLampiranPengaduan(desa.id, berkas) : null;

    const hasil = await kirimPengaduanData(desa.id, parsed.data, lampiran);
    revalidatePath(PATH_PUBLIK);

    return successState(
      `Pengaduan terkirim dengan nomor tiket ${hasil.nomorTiket}. Simpan nomor ini untuk melacak status.`,
      hasil.nomorTiket,
    );
  } catch (error) {
    return toErrorState(error);
  }
}
