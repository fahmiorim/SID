import { ArrowLeft, FileDown } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getIdentitas } from "@/features/desa/application/get-identitas";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  getSuplemenDetailUseCase,
  getSuplemenReferencesUseCase,
  labelSasaranSuplemen,
} from "@/features/penduduk/application/suplemen-use-cases";
import { SUPLEMEN_RESOURCE } from "@/features/penduduk/domain/suplemen";
import { kolomIsian } from "@/features/penduduk/domain/suplemen-berkas";
import { LaporanPrintButton } from "@/features/penduduk/presentation/components/laporan-print-button";
import { SuplemenImporDialog } from "@/features/penduduk/presentation/components/suplemen/suplemen-impor-dialog";
import { SuplemenTerdataIsianForm } from "@/features/penduduk/presentation/components/suplemen/suplemen-terdata-isian-form";
import { SuplemenTerdataRowActions } from "@/features/penduduk/presentation/components/suplemen/suplemen-terdata-row-actions";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Detail Suplemen",
};

export default async function DetailSuplemenPage({ params }: PageProps<"/penduduk/suplemen/[id]">) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, SUPLEMEN_RESOURCE, "read")) {
    return <NoAccess title="Detail Suplemen" description="Data terdata sebuah suplemen." />;
  }

  const { id } = await params;
  const suplemenId = Number(id);
  if (!Number.isInteger(suplemenId) || suplemenId <= 0) {
    return <NoAccess title="Detail Suplemen" description="Suplemen tidak valid." />;
  }

  const villageId = await resolveVillageId(user);
  const detail = await getSuplemenDetailUseCase(villageId, suplemenId);

  if (!detail) {
    return <NoAccess title="Detail Suplemen" description="Suplemen tidak ditemukan." />;
  }

  const canManage = hasPermission(user.permissions, SUPLEMEN_RESOURCE, "update");
  const canDelete = hasPermission(user.permissions, SUPLEMEN_RESOURCE, "delete");
  const [references, desa] = await Promise.all([
    getSuplemenReferencesUseCase(villageId),
    getIdentitas(),
  ]);
  const kolom = kolomIsian(detail.terdata);

  return (
    <div className="space-y-6">
      <PageHeader
        title={detail.suplemen.nama}
        description={`Sasaran ${labelSasaranSuplemen(detail.suplemen.sasaran)} — ${detail.terdata.length} terdata`}
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Button variant="outline" asChild>
              <Link href="/penduduk/suplemen">
                <ArrowLeft className="size-4" />
                Daftar Suplemen
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a href={`/penduduk/suplemen/${suplemenId}/ekspor`}>
                <FileDown className="size-4" />
                Ekspor CSV
              </a>
            </Button>
            <LaporanPrintButton />
            {canManage ? (
              <SuplemenImporDialog suplemenId={suplemenId} sasaran={detail.suplemen.sasaran} />
            ) : null}
          </div>
        }
      />

      <div className="hidden text-center print:block">
        <p className="text-lg font-bold uppercase">Data Suplemen</p>
        <p className="text-sm">{detail.suplemen.nama}</p>
        <p className="text-sm">
          {desa?.namaDesa ? `Desa ${desa.namaDesa}` : "Desa"} — sasaran{" "}
          {labelSasaranSuplemen(detail.suplemen.sasaran)}
        </p>
      </div>

      {detail.suplemen.keterangan ? (
        <Card className="print:hidden">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            {detail.suplemen.keterangan}
          </CardContent>
        </Card>
      ) : null}

      {canManage ? (
        <div className="print:hidden">
          <SuplemenTerdataIsianForm
            suplemenId={suplemenId}
            sasaran={detail.suplemen.sasaran}
            penduduk={references.penduduk}
            keluarga={references.keluarga}
            canManage={canManage}
            suggestedColumns={kolom}
          />
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Terdata ({detail.terdata.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {detail.terdata.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Belum ada sasaran yang terdata pada suplemen ini.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>Sasaran</TableHead>
                    {kolom.map((nama) => (
                      <TableHead key={nama}>{nama}</TableHead>
                    ))}
                    {canDelete ? (
                      <TableHead className="w-16 text-right print:hidden">Aksi</TableHead>
                    ) : null}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.terdata.map((row, indeks) => (
                    <TableRow key={row.id}>
                      <TableCell className="tabular-nums">{indeks + 1}</TableCell>
                      <TableCell className="font-medium">{row.label}</TableCell>
                      {kolom.map((nama) => (
                        <TableCell key={nama}>
                          {row.isian[nama] ?? <span className="text-muted-foreground">—</span>}
                        </TableCell>
                      ))}
                      {canDelete ? (
                        <TableCell className="text-right print:hidden">
                          <SuplemenTerdataRowActions
                            terdataId={row.id}
                            label={row.label}
                            canDelete={canDelete}
                          />
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Integrasi form builder untuk dataFormIsian telah tersedia
