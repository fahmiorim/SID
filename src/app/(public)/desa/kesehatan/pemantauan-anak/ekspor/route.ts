import { NextResponse } from "next/server";

import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { listBulananAnak } from "@/features/kesehatan/infrastructure/kesehatan-repository";

/**
 * Ekspor publik data Pemantauan Anak ke halaman HTML.
 *
 * Menampilkan tabel transparansi di browser sekaligus menyediakan tautan
 * unduh CSV agar warga dapat menyimpannya. Tidak memerlukan autentikasi.
 */
export async function GET() {
  const desa = await getIdentitasFromRequest();
  const rows = await listBulananAnak(desa.id);

  const namaDesa =
    (desa.namaDesa ?? "desa")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "desa";

  const statusGiziLabel = (v: number | null | undefined) =>
    v === 1 ? "Normal" : v === 2 ? "Kurang" : v === 3 ? "Buruk" : "Stunting";

  const statusTikarLabel = (v: number | null | undefined) =>
    v === 2 ? "Merah" : v === 3 ? "Kuning" : v === 4 ? "Hijau" : "-";

  const csvRows = rows
    .map((r) => {
      const cell = (v: unknown) =>
        typeof v === "string"
          ? v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
          : String(v ?? "-");
      return `<tr><td>${r.id}</td><td>${r.posyanduId}</td><td>${r.umurBulan}</td><td>${cell(statusGiziLabel(r.statusGizi))}</td><td>${cell(statusTikarLabel(r.statusTikar))}</td><td>${r.pemberianImunisasiDasar ? "Ya" : "Tidak"}</td></tr>`;
    })
    .join("\n    ");

  const csvLines = [
    "ID,Posyandu,Umur Bulan,Status Gizi,Status Tikar,Imunisasi",
    ...rows.map((r) => {
      const g = statusGiziLabel(r.statusGizi);
      const t = statusTikarLabel(r.statusTikar);
      return `${r.id},${r.posyanduId},${r.umurBulan},"${g}","${t}",${r.pemberianImunisasiDasar ? "Ya" : "Tidak"}`;
    }),
  ].join("\r\n");
  const csvBlob = new Blob([csvLines], { type: "text/csv" });
  const csvUrl = URL.createObjectURL(csvBlob);

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>Ekspor Pemantauan Anak - ${desa.namaDesa ?? "Desa"}</title>
  <style>
    body { font-family: sans-serif; margin: 2rem; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
    th { background: #f5f5f5; }
    .btn { display: inline-block; padding: 8px 16px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>Pemantauan Anak — ${desa.namaDesa ?? "Desa"}</h1>
  <p><a class="btn" href="${csvUrl}" download="pemantauan-anak-${namaDesa}.csv">Unduh CSV</a></p>
  <table>
    <thead><tr><th>ID</th><th>Posyandu</th><th>Umur Bulan</th><th>Status Gizi</th><th>Status Tikar</th><th>Imunisasi</th></tr></thead>
    <tbody>\n    ${csvRows}\n  </tbody>
  </table>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
