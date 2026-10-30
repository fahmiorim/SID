import { NextResponse } from "next/server";

import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { listKia } from "@/features/kesehatan/infrastructure/kesehatan-repository";

/**
 * Ekspor publik data KIA ke halaman HTML.
 *
 * Menampilkan tabel transparansi di browser sekaligus menyediakan tautan
 * unduh CSV agar warga dapat menyimpannya. Tidak memerlukan autentikasi.
 */
export async function GET() {
  const desa = await getIdentitasFromRequest();
  const rows = await listKia(desa.id);

  const namaDesa =
    (desa.namaDesa ?? "desa")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "desa";

  const csvRows = rows
    .map((r) => {
      const cell = (v: unknown) =>
        typeof v === "string"
          ? v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
          : String(v ?? "-");
      return `<tr><td>${r.id}</td><td>${cell(r.noKia)}</td><td>${cell(r.ibuName)}</td><td>${cell(r.posyanduId)}</td></tr>`;
    })
    .join("\n    ");

  const csvLines = [
    "No,KIA,Ibu,Posyandu",
    ...rows.map((r) => `${r.id},"${r.noKia}","${r.ibuName ?? "-"}",${r.posyanduId ?? "-"}`),
  ].join("\r\n");
  const csvBlob = new Blob([csvLines], { type: "text/csv" });
  const csvUrl = URL.createObjectURL(csvBlob);

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>Ekspor KIA - ${desa.namaDesa ?? "Desa"}</title>
  <style>
    body { font-family: sans-serif; margin: 2rem; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
    th { background: #f5f5f5; }
    .btn { display: inline-block; padding: 8px 16px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>Kesehatan Ibu dan Anak (KIA) — ${desa.namaDesa ?? "Desa"}</h1>
  <p><a class="btn" href="${csvUrl}" download="kia-${namaDesa}.csv">Unduh CSV</a></p>
  <table>
    <thead><tr><th>No</th><th>KIA</th><th>Ibu</th><th>Posyandu</th></tr></thead>
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
