/**
 * URL verifikasi surat publik — dipakai halaman cetak, PDF admin, dan PDF
 * warga agar format tautan (dan isi kode QR) selalu sama.
 */
export function buildVerificationUrl(origin: string, token: string): string {
  const dasar = origin.trim().replace(/\/+$/, "");
  const bersih = token.trim();

  return `${dasar}/desa/verifikasi-surat/${encodeURIComponent(bersih)}`;
}
