import { Files } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { hasPermission } from "@/features/rbac/application/authorization";
import {
  listJenisSuratWithMeta,
  listSyaratSuratOptions,
} from "@/features/surat/application/master-use-cases";
import { parseIsianFields, parseSyaratIds } from "@/features/surat/domain/isian";
import { JENIS_SURAT_RESOURCE } from "@/features/surat/domain/surat";
import { JenisSuratCreateButton } from "@/features/surat/presentation/components/jenis-surat-create-button";
import { JenisSuratRowActions } from "@/features/surat/presentation/components/jenis-surat-row-actions";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Jenis Surat",
};

export default async function JenisSuratPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, JENIS_SURAT_RESOURCE, "read")) {
    return <NoAccess title="Jenis Surat" description="Katalog template surat desa." />;
  }

  const [{ rows, classifications }, syarat] = await Promise.all([
    listJenisSuratWithMeta(),
    listSyaratSuratOptions(),
  ]);
  const canManage = hasPermission(user.permissions, JENIS_SURAT_RESOURCE, "update");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jenis Surat"
        description="Katalog template, format nomor, dan masa berlaku surat."
        actions={
          canManage ? (
            <JenisSuratCreateButton classifications={classifications} syarat={syarat} />
          ) : null
        }
      />

      <Card>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Kode</TableHead>
                  <TableHead>Nama Surat</TableHead>
                  <TableHead>Klasifikasi</TableHead>
                  <TableHead className="w-28">Masa Berlaku</TableHead>
                  <TableHead className="w-32">Isian</TableHead>
                  <TableHead className="w-24">Penduduk</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  {canManage ? <TableHead className="w-14 text-right">Aksi</TableHead> : null}
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canManage ? 8 : 7} className="h-28 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Files className="size-5" />
                        <p className="text-sm">Belum ada jenis surat.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => {
                    const jumlahIsian = parseIsianFields(row.formIsian).length;
                    const jumlahSyarat = parseSyaratIds(row.syaratSurat).length;

                    return (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.code}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.classificationName ?? "—"}</TableCell>
                        <TableCell>{row.validityMonths} bulan</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {jumlahIsian > 0 ? `${jumlahIsian} isian` : "—"}
                          {jumlahSyarat > 0 ? ` · ${jumlahSyarat} syarat` : ""}
                        </TableCell>
                        <TableCell>{row.requiresResident ? "Wajib" : "Opsional"}</TableCell>
                        <TableCell>
                          <Badge variant={row.isActive ? "secondary" : "outline"}>
                            {row.isActive ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </TableCell>
                        {canManage ? (
                          <TableCell className="text-right">
                            <JenisSuratRowActions
                              jenis={row}
                              classifications={classifications}
                              syarat={syarat}
                            />
                          </TableCell>
                        ) : null}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
