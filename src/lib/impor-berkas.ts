import "server-only";

import {
  bacaTabelImpor,
  BATAS_UKURAN_IMPOR,
  ekstensiImporDidukung,
  petakanKolom,
  type BarisImpor,
  type HasilImpor,
  type KolomImpor,
} from "./spreadsheet";

/**
 * Pembacaan berkas impor dari FormData (server-side).
 *
 * Validasi yang ditegakkan sebelum data disentuh:
 * - hanya `.csv`, `.txt`, dan `.xlsx`;
 * - ukuran maksimum `BATAS_UKURAN_IMPOR`;
 * - berkas XLSX wajib bertanda tangan ZIP (`PK`) agar bukan berkas lain yang
 *   hanya diberi ekstensi `.xlsx`.
 *
 * Nilai kembali berupa pesan galat manusiawi (bukan exception) supaya setiap
 * action impor bisa menampilkannya apa adanya.
 */
export type HasilBacaImpor<Kunci extends string> =
  { ok: true; hasil: HasilImpor<Kunci> } | { ok: false; pesan: string };

/** Baca & petakan satu berkas impor dari FormData. */
export async function bacaImporDariFormData<Kunci extends string>(
  berkas: FormDataEntryValue | null,
  kolom: readonly KolomImpor<Kunci>[],
): Promise<HasilBacaImpor<Kunci>> {
  if (!(berkas instanceof File) || berkas.size === 0) {
    return { ok: false, pesan: "Pilih berkas CSV atau XLSX yang ingin diimpor." };
  }

  if (!ekstensiImporDidukung(berkas.name)) {
    return { ok: false, pesan: "Format berkas harus .csv, .txt, atau .xlsx." };
  }

  if (berkas.size > BATAS_UKURAN_IMPOR) {
    return {
      ok: false,
      pesan: `Ukuran berkas maksimal ${Math.round(BATAS_UKURAN_IMPOR / (1024 * 1024))} MB.`,
    };
  }

  const buffer = Buffer.from(await berkas.arrayBuffer());

  if (berkas.name.toLowerCase().endsWith(".xlsx")) {
    const tandaZip = buffer.subarray(0, 2).toString("binary");
    if (tandaZip !== "PK") {
      return { ok: false, pesan: "Berkas .xlsx tidak valid (bukan arsip spreadsheet)." };
    }
  }

  let tabel: string[][];
  try {
    tabel = await bacaTabelImpor(buffer, berkas.name);
  } catch {
    return { ok: false, pesan: "Berkas tidak dapat dibaca. Pastikan berkas tidak rusak." };
  }

  return { ok: true, hasil: petakanKolom(tabel, kolom) };
}

/** Ringkasan hasil impor untuk pesan umpan balik ke pengguna. */
export function ringkasanImpor<Kunci extends string>(hasil: HasilImpor<Kunci>): string {
  if (hasil.baris.length === 0) {
    const pesan = hasil.galat[0]?.pesan ?? "Tidak ada baris data yang bisa diimpor.";
    return pesan;
  }
  return `${hasil.baris.length} baris siap diimpor.`;
}

export type { BarisImpor, HasilImpor, KolomImpor };
