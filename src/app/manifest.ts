import type { MetadataRoute } from "next";

import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { getTemaAktif } from "@/features/publik/application/tema-use-cases";
import { APP_NAME } from "@/lib/app-config";

/**
 * Manifest PWA per desa (Fase 4).
 *
 * Berkas ini adalah *metadata route* Next.js di root `app`, sehingga URL-nya
 * `/manifest.webmanifest`. Karena memakai `headers()` (lewat
 * `getIdentitasFromRequest`), rute ini **dinamis**: nama, keterangan, dan
 * warna tema mengikuti desa pemilik host, bukan satu nilai global.
 *
 * Host tak dikenal (atau database belum siap) tidak boleh membuat manifest 500,
 * jadi dipakai nilai umum aplikasi. Halaman publik tetap menampilkan 404 untuk
 * host yang tidak terdaftar karena resolusi tenant ditegakkan di layout.
 */

const WARNA_BAWAAN = "#0f766e";

/** `short_name` sebaiknya pendek; nama panjang dipotong dengan elipsis. */
function pendekkan(nama: string): string {
  return nama.length > 12 ? `${nama.slice(0, 11)}…` : nama;
}

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  let nama = APP_NAME;
  let keterangan = "pemerintahan desa";
  let warna = WARNA_BAWAAN;

  try {
    const desa = await getIdentitasFromRequest();
    const bagian = [desa.namaDesa, desa.namaKecamatan, desa.namaKabupaten].filter(
      (item): item is string => Boolean(item),
    );

    if (desa.namaDesa) nama = desa.namaDesa;
    if (bagian.length > 0) keterangan = bagian.join(", ");
    warna = (await getTemaAktif(desa.id)).opsi.warnaPrimer;
  } catch {
    // Fallback: manifest umum agar perayap/browser tidak menerima 500.
  }

  return {
    name: nama,
    short_name: pendekkan(nama),
    description: `Situs resmi ${keterangan}.`,
    lang: "id",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: warna,
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
