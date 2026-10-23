import "server-only";

import { listDokumenPublik } from "@/features/publik/infrastructure/content-repository";

/**
 * Dokumen informasi publik yang aktif untuk satu desa.
 *
 * Halaman publik tidak memanggil repository secara langsung; use case ini
 * menjadi batas lapisan aplikasi dan tempat menambahkan aturan tampilan
 * (misalnya penyaringan kategori) di kemudian hari.
 */
export async function daftarDokumenPublik(villageId: number) {
  return listDokumenPublik(villageId);
}
