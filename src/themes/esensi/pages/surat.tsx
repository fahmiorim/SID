import type { SuratProps } from "@/themes/types";
import { ThemeButton, ThemeCard, ThemeEmpty, ThemePageHeader } from "@/themes/ui";

/** Jenis surat yang dilayani desa + tautan verifikasi. */
export function EsensiSurat({ ctx, jenis }: SuratProps) {
  return (
    <div className="space-y-8">
      <ThemePageHeader
        title="Surat & Layanan Administrasi"
        description={`Jenis surat yang dapat diajukan melalui layanan ${ctx.desa.namaDesa ?? "desa"}.`}
      />

      <div className="flex flex-wrap items-center gap-3">
        <ThemeButton href="/desa/verifikasi-surat">Verifikasi Surat</ThemeButton>
        <ThemeButton href="/layanan-mandiri" variant="outline">
          Ajukan Layanan Mandiri
        </ThemeButton>
      </div>

      {jenis.length === 0 ? (
        <ThemeEmpty>Jenis surat belum tersedia. Silakan hubungi kantor desa.</ThemeEmpty>
      ) : (
        <ThemeCard>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Kode</th>
                  <th className="px-4 py-3 font-medium">Jenis Surat</th>
                  <th className="px-4 py-3 font-medium">Klasifikasi</th>
                  <th className="px-4 py-3 font-medium">Pemohon</th>
                  <th className="px-4 py-3 text-right font-medium">Masa Berlaku</th>
                </tr>
              </thead>
              <tbody>
                {jenis.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-3 font-mono text-xs">{item.kode}</td>
                    <td className="px-4 py-3 font-medium">{item.nama}</td>
                    <td className="px-4 py-3">{item.klasifikasi ?? "-"}</td>
                    <td className="px-4 py-3">
                      {item.butuhPenduduk ? "Penduduk terdaftar" : "Umum"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {item.masaBerlakuBulan > 0
                        ? `${item.masaBerlakuBulan.toLocaleString("id-ID")} bulan`
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ThemeCard>
      )}

      <p className="text-sm text-muted-foreground">
        Keaslian surat dapat diperiksa dengan token atau kode QR yang tercantum pada dokumen.
      </p>
    </div>
  );
}
