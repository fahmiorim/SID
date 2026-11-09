/**
 * Tautan "lewati ke konten utama".
 *
 * Tersembunyi secara visual hingga menerima fokus keyboard. Tanpa tautan ini
 * pengguna papan tombol harus melewati seluruh header dan navigasi di setiap
 * halaman sebelum mencapai konten.
 *
 * Sasaran (`targetId`) wajib memakai `tabIndex={-1}` agar fokus benar-benar
 * berpindah ke `<main>` saat tautan diaktifkan.
 */
export function SkipLink({
  targetId = "konten-utama",
  label = "Lewati ke konten utama",
}: {
  targetId?: string;
  label?: string;
}) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:border focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-foreground focus:shadow-lg"
    >
      {label}
    </a>
  );
}
