export const DOKUMEN_KATEGORI = ["informasi_publik", "produk_hukum", "embed", "lainnya"] as const;
export type DokumenKategori = (typeof DOKUMEN_KATEGORI)[number];

export const DOKUMEN_KATEGORI_LABELS: Readonly<Record<DokumenKategori, string>> = {
  informasi_publik: "Informasi publik",
  produk_hukum: "Produk hukum & peraturan",
  embed: "Sematan",
  lainnya: "Lainnya",
};

export const DOKUMEN_KATEGORI_FILTERS = [
  { value: "semua", label: "Semua kategori" },
  ...DOKUMEN_KATEGORI.map((value) => ({
    value,
    label: DOKUMEN_KATEGORI_LABELS[value],
  })),
] as const;

export type DokumenKategoriFilter = "semua" | DokumenKategori;

export function parseDokumenKategoriFilter(value: string | undefined): DokumenKategoriFilter {
  return value && (DOKUMEN_KATEGORI as readonly string[]).includes(value)
    ? (value as DokumenKategori)
    : "semua";
}

export function isHttpsEmbedUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname !== "" && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function isSafeDocumentLink(value: string): boolean {
  if (!value || value.trim() !== value || /[\u0000-\u001f\u007f]/.test(value)) return false;
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return true;

  try {
    const url = new URL(value);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.hostname !== "" &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

export function isPdfDocument(isi: Uint8Array): boolean {
  return (
    isi.length >= 5 &&
    isi[0] === 0x25 &&
    isi[1] === 0x50 &&
    isi[2] === 0x44 &&
    isi[3] === 0x46 &&
    isi[4] === 0x2d
  );
}

export const DOKUMEN_PAGE_SIZE = 20;
