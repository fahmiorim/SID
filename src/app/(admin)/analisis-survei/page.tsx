import { ChartColumn, ClipboardList } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

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
import { RESOURCES } from "@/features/rbac/domain/resources";
import { listSurveyData } from "@/features/survey/application/use-cases";
import { SurveyCreateButton } from "@/features/survey/presentation/components/survey-create-button";
import { SurveyRowActions } from "@/features/survey/presentation/components/survey-row-actions";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = { title: "Analisis & Survei" };

function formatTanggal(value: Date | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("id-ID", { dateStyle: "medium" });
}

export default async function AnalisisSurveiPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, RESOURCES.analisisSurvei, "read")) {
    return <NoAccess title="Analisis & Survei" description="Survei warga dan rekap jawabannya." />;
  }

  const survei = await listSurveyData();
  const canWrite = hasPermission(user.permissions, RESOURCES.analisisSurvei, "update");
  const canDelete = hasPermission(user.permissions, RESOURCES.analisisSurvei, "delete");

  const aktif = survei.filter((item) => item.aktif).length;
  const totalResponden = survei.reduce((sum, item) => sum + item.jumlahResponden, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analisis & Survei"
        description="Susun pertanyaan, catat responden, dan lihat rekap jawaban warga."
        actions={canWrite ? <SurveyCreateButton /> : null}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">Total survei</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{survei.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">Survei aktif</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{aktif}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">Responden tercatat</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{totalResponden}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="overflow-x-auto pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Survei</TableHead>
                <TableHead className="w-24 text-right">Pertanyaan</TableHead>
                <TableHead className="w-24 text-right">Responden</TableHead>
                <TableHead className="w-28">Status</TableHead>
                <TableHead className="w-28">Dibuat</TableHead>
                <TableHead className="w-16 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {survei.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-28 text-center text-muted-foreground">
                    <ChartColumn className="mx-auto mb-2 size-5" />
                    Belum ada survei. Buat survei pertama untuk mulai menghimpun pendapat warga.
                  </TableCell>
                </TableRow>
              ) : (
                survei.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Link
                        href={`/analisis-survei/${item.id}`}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {item.judul}
                      </Link>
                      {item.deskripsi ? (
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {item.deskripsi}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{item.jumlahSoal}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {item.jumlahResponden}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.aktif ? "default" : "outline"}>
                        {item.aktif ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatTanggal(item.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <SurveyRowActions survey={item} canDelete={canDelete} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-start gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        <ClipboardList className="mt-0.5 size-4 shrink-0" />
        <p>
          Jawaban warga dicatat oleh operator lewat tombol <strong>Tambah Responden</strong> pada
          detail survei. Pengisian mandiri oleh warga belum tersedia.
        </p>
      </div>
    </div>
  );
}
