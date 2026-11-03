import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getBantuanDiterimaWargaData } from "@/features/bantuan/application/use-cases";
import {
  asalDanaLabel,
  sasaranLabel,
  STATUS_MASA_AKTIF_LABELS,
  statusMasaAktif,
} from "@/features/bantuan/domain/bantuan";
import { verifyWargaPage } from "@/lib/dal";

export const metadata: Metadata = { title: "Bantuan yang Diterima" };

function formatTanggal(value: string | null): string {
  if (!value) return "Tidak ditentukan";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export default async function LayananBantuanPage() {
  await verifyWargaPage();
  const programs = await getBantuanDiterimaWargaData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bantuan yang Diterima</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Program bantuan yang mencatat Anda, keluarga, rumah tangga, atau kelompok Anda sebagai
          penerima. Informasi ini bukan bukti pencairan bantuan.
        </p>
      </div>

      {programs.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center" role="status">
            <h2 className="font-medium">Belum ada bantuan yang tercatat</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Jika informasi ini tidak sesuai, silakan hubungi kantor desa.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {programs.map((program) => {
            const status = statusMasaAktif(program.startDate, program.endDate);
            const variant =
              status === "aktif" ? "default" : status === "selesai" ? "secondary" : "outline";

            return (
              <li key={program.id}>
                <Card>
                  <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <CardTitle>{program.name}</CardTitle>
                      {program.description ? (
                        <CardDescription>{program.description}</CardDescription>
                      ) : null}
                    </div>
                    <Badge variant={variant}>{STATUS_MASA_AKTIF_LABELS[status]}</Badge>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-muted-foreground">Sasaran program</dt>
                        <dd className="font-medium">{sasaranLabel(program.sasaran)}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Masa program</dt>
                        <dd className="font-medium">
                          {formatTanggal(program.startDate)} – {formatTanggal(program.endDate)}
                        </dd>
                      </div>
                      {program.asalDana !== null ? (
                        <div>
                          <dt className="text-muted-foreground">Asal dana</dt>
                          <dd className="font-medium">{asalDanaLabel(program.asalDana)}</dd>
                        </div>
                      ) : null}
                    </dl>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
