import { ImageResponse } from "next/og";

import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { getTemaAktif } from "@/features/publik/application/tema-use-cases";
import { APP_NAME } from "@/lib/app-config";

/**
 * Gambar OG situs publik per desa (Fase 4).
 *
 * Metadata route ini dipakai otomatis sebagai `og:image` halaman yang
 * mewarisinya. Karena memakai `headers()` (lewat `getIdentitasFromRequest`),
 * gambar dibuat per permintaan mengikuti desa pemilik host, dengan warna tema
 * aktif. Host tak dikenal memakai nilai umum aplikasi agar tidak 500.
 */

export const alt = "Situs resmi desa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const WARNA_BAWAAN = "#0f766e";

export default async function Image() {
  let nama = APP_NAME;
  let warna = WARNA_BAWAAN;

  try {
    const desa = await getIdentitasFromRequest();
    if (desa.namaDesa) nama = desa.namaDesa;
    warna = (await getTemaAktif(desa.id)).opsi.warnaPrimer;
  } catch {
    // Fallback: gambar umum agar perayap sosial tidak menerima 500.
  }

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: warna,
        color: "#ffffff",
        padding: 72,
      }}
    >
      <div style={{ display: "flex", fontSize: 26, letterSpacing: 6, opacity: 0.85 }}>
        {APP_NAME.toUpperCase()}
      </div>
      <div style={{ display: "flex", fontSize: 82, lineHeight: 1.1 }}>{nama}</div>
      <div style={{ display: "flex", fontSize: 30, opacity: 0.9 }}>
        Profil · Berita · APBDes · Layanan Mandiri
      </div>
    </div>,
    size,
  );
}
