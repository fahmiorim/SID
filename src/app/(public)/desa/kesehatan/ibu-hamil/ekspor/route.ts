import { NextResponse } from "next/server";

import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { listIbuHamil } from "@/features/kesehatan/infrastructure/kesehatan-repository";

/**
 * Ekspor publik data Ibu Hamil ke halaman HTML.
 *
 * Menampilkan tabel transparansi di browser sekaligus menyediakan tautan
 * unduh CSV agar warga dapat menyimpannya. Tidak memerlukan autentikasi.
 */
export async function GET() {
  const desa = await getIdentitasFromRequest();
  const rows = await listIbuHamil(desa.id);

  const namaDesa =
    (desa.namaDesa ?? "desa")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "desa";

  const statusKehamilanLabel = (v: number | null | undefined) =>
    v === 1 ? "Normal" : v === 2 ? "Risiko Tinggi" : v === 3 ? "KEK" : "-";

  const csvRows = rows
    .map((r) => {
      const cell = (v: unknown) =>
        typeof v === "string"
          ? v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
          : String(v ?? "-");
      return `<tr><td>${r.id}</td><td>${r.posyanduId}</td><td>${cell(statusKehamilanLabel(r.statusKehamilan))}</td><td>${cell(r.usiaKehamilan)}</td><td>${r.pemeriksaanKehamilan ? "Ya" : "Tidak"}</td><td>${r.pemeriksaanNifas ? "Ya" : "Tidak"}</td></tr>`;
    })
    .join("\n    ");

  const csvLines = [
    "ID,Posyandu,Status Kehamilan,Usia Hamil,Pemeriksaan,Nifas",
    ...rows.map((r) => {
      const s = statusKehamilanLabel(r.statusKehamilan);
      return `${r.id},${r.posyanduId},"${s}",${r.usiaKehamilan ?? "-"},${r.pemeriksaanKehamilan ? "Ya" : "Tidak"},${r.pemeriksaanNifas ? "Ya" : "Tidak"}`;
    }),
  ].join("\r\n");
  const csvBlob = new Blob([csvLines], { type: "text/csv" });
  const csvUrl = URL.createObjectURL(csvBlob);

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>Ekspor Ibu Hamil - ${desa.namaDesa ?? "Desa"}</title>
  <style>
    body { font-family: sans-serif; margin: 2rem; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
    th { background: #f5f5f5; }
    .btn { display: inline-block; padding: 8px 16px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>Pemantauan Ibu Hamil — ${desa.namaDesa ?? "Desa"}</h1>
  <p><a class="btn" href="${csvUrl}" download="ibu-hamil-${namaDesa}.csv">Unduh CSV</a></p>
  <table>
    <thead><tr><th>ID</th><th>Posyandu</th><th>Status Kehamilan</th><th>Usia Hamil</th><th>Pemeriksaan</th><th>Nifas</th></tr></thead>
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
