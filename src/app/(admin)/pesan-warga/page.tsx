import { MessageSquare } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  daftarPercakapanWargaData,
  getPercakapanWargaData,
} from "@/features/pesan-warga/application/pesan-warga-use-cases";
import { labelPengirimPesan } from "@/features/pesan-warga/domain/pesan-warga";
import { BalasPesanForm } from "@/features/pesan-warga/presentation/components/balas-pesan-form";
import { hasPermission } from "@/features/rbac/application/authorization";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { verifySession } from "@/lib/dal";

export const metadata = { title: "Pesan Warga" };

export default async function PesanWargaAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ residentId?: string }>;
}) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, RESOURCES.pesanWarga, "read")) {
    return (
      <NoAccess
        title="Pesan Warga"
        description="Anda tidak memiliki izin untuk membuka modul ini."
      />
    );
  }

  const params = await searchParams;
  const residentId = Number(params.residentId ?? "");
  const terpilih =
    Number.isInteger(residentId) && residentId > 0
      ? await getPercakapanWargaData(residentId)
      : null;
  const percakapan = await daftarPercakapanWargaData();
  const totalBelumDibaca = percakapan.reduce((jumlah, item) => jumlah + item.belumDibaca, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pesan Warga"
        description={`Percakapan dua arah dengan warga desa. ${totalBelumDibaca} pesan warga belum dibaca.`}
      />

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daftar percakapan</CardTitle>
            <CardDescription>Satu baris per warga, terbaru di atas.</CardDescription>
          </CardHeader>
          <CardContent>
            {percakapan.length === 0 ? (
              <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                Belum ada pesan dari warga.
              </p>
            ) : (
              <ul className="divide-y">
                {percakapan.map((item) => (
                  <li key={item.residentId}>
                    <Link
                      href={`/pesan-warga?residentId=${item.residentId}`}
                      className={`flex flex-col gap-1 py-3 first:pt-0 last:pb-0 hover:bg-muted/50 ${
                        terpilih?.penduduk.residentId === item.residentId ? "font-medium" : ""
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm">{item.nama}</span>
                        {item.belumDibaca > 0 ? (
                          <Badge variant="destructive">{item.belumDibaca} baru</Badge>
                        ) : null}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {item.pengirimTerakhir === "operator" ? "Anda: " : ""}
                        {item.pesanTerakhir}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {item.terakhirPada
                          ? new Date(item.terakhirPada).toLocaleString("id-ID")
                          : "—"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          {terpilih ? (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="size-4 text-muted-foreground" />
                  {terpilih.penduduk.nama}
                </CardTitle>
                <CardDescription>NIK {terpilih.penduduk.nik ?? "—"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {terpilih.pesan.length === 0 ? (
                  <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Percakapan ini belum memiliki pesan.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {terpilih.pesan.map((item) => (
                      <li
                        key={item.id}
                        className={
                          item.pengirim === "operator"
                            ? "ml-auto max-w-[85%] rounded-lg bg-primary px-3 py-2 text-primary-foreground"
                            : "mr-auto max-w-[85%] rounded-lg bg-muted px-3 py-2"
                        }
                      >
                        <p className="text-xs font-medium opacity-80">
                          {labelPengirimPesan(item.pengirim)}
                        </p>
                        <p className="text-sm whitespace-pre-line">{item.isi}</p>
                        <p className="mt-1 text-[11px] opacity-70">
                          {item.createdAt ? new Date(item.createdAt).toLocaleString("id-ID") : "—"}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}

                <BalasPesanForm residentId={terpilih.penduduk.residentId} />
              </CardContent>
            </>
          ) : (
            <CardContent className="flex min-h-48 items-center justify-center py-10 text-center text-sm text-muted-foreground">
              Pilih salah satu percakapan untuk membaca dan membalas pesan warga.
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
