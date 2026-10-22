/**
 * Helper murni untuk situs publik (Fase 1C).
 */

/** Susun URL publik untuk sebuah media relatif. */
export function urlMedia(relatif: string | null | undefined): string | null {
  if (!relatif) return null;
  const bersih = relatif.replace(/^\/+/, "");
  return `/api/publik/media/${bersih}`;
}

/** Format tanggal Indonesia (mis. `3 Januari 2026`). */
const TANGGAL_FORMAT = new Intl.DateTimeFormat("id-ID", { dateStyle: "long" });

export function formatTanggal(tanggal: Date | string | null | undefined): string {
  if (!tanggal) return "";
  const nilai = typeof tanggal === "string" ? new Date(tanggal) : tanggal;
  if (Number.isNaN(nilai.getTime())) return "";
  return TANGGAL_FORMAT.format(nilai);
}

/** Potong teks menjadi ringkasan pendek pada batas kata. */
export function ringkasTeks(teks: string | null | undefined, panjang = 160): string {
  if (!teks) return "";
  const polos = teks.replace(/<[^>]+>/g, "").trim();
  if (polos.length <= panjang) return polos;
  const potong = polos.slice(0, panjang);
  const spasiTerakhir = potong.lastIndexOf(" ");
  return `${(spasiTerakhir > 40 ? potong.slice(0, spasiTerakhir) : potong).trimEnd()}…`;
}

/** Ubah misi tersimpan (satu per baris) menjadi daftar. */
export function parseMisi(misi: string | null | undefined): string[] {
  if (!misi) return [];
  return misi
    .split(/\r?\n/)
    .map((baris) => baris.replace(/^[-•*\d.\s]+/, "").trim())
    .filter((baris) => baris.length > 0);
}
