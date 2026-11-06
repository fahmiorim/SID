import { ArrowLeft, BarChart3, FileDown, MessageSquareText, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Badge } from "@/components/ui/badge";
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
import { hasPermission } from "@/features/rbac/application/authorization";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { getLaporanSkorData } from "@/features/survey/application/use-cases";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = { title: "Laporan Skor Survei" };

export default async function LaporanSkorPage({
  params,
}: PageProps<"/analisis-survei/[id]/laporan">) {
  const { id } = await params;
  const surveyId = Number(id);

  if (!Number.isInteger(surveyId) || surveyId < 1) notFound();

  const user = await verifySession();

  if (!hasPermission(user.permissions, RESOURCES.analisisSurvei, "read")) {
    return <NoAccess title="Analisis & Survei" description="Survei warga dan rekap jawabannya." />;
  }

  const data = await getLaporanSkorData(surveyId);
  // Note: getLaporanSkorData throws 404 via pastikanSurvei if survey not found

  const {
    survei,
    jumlahResponden,
    rataRata,
    klasifikasiDominan,
    perResponden,
    distribusi,
    perIndikator,
    perKategori,
  } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Laporan Skor: ${survei.judul}`}
        description="Hasil analisis skor survei dan distribusi klasifikasi."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/analisis-survei/${surveyId}`}>
                <ArrowLeft className="size-4" />
                Kembali
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/analisis-survei/${surveyId}/laporan/ekspor`}>
                <FileDown className="size-4" />
                Ekspor CSV
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <Users className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Responden</p>
              <p className="text-2xl font-semibold tabular-nums">{jumlahResponden}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <BarChart3 className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Rata-rata Skor</p>
              <p className="text-2xl font-semibold tabular-nums">{rataRata}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <MessageSquareText className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Klasifikasi Dominan</p>
              <p className="text-lg font-semibold">{klasifikasiDominan}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Distribusi Klasifikasi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {distribusi.map((item) => (
              <Badge key={item.label} variant={item.jumlah > 0 ? "default" : "outline"}>
                {item.label}: {item.jumlah} ({item.persentase}%)
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ringkasan per Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Jumlah Indikator</TableHead>
                <TableHead className="text-right">Rata-rata</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {perKategori.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-20 text-center text-muted-foreground">
                    Belum ada indikator yang dinilai.
                  </TableCell>
                </TableRow>
              ) : (
                perKategori.map((item) => (
                  <TableRow key={item.kategori ?? "tanpa-kategori"}>
                    <TableCell>{item.kategori ?? "Tanpa kategori"}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {item.jumlahIndikator}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{item.rataRata}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Analisis per Indikator</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Indikator</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Rata-rata</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {perIndikator.map((item) => (
                <TableRow key={item.indikatorId ?? "null"}>
                  <TableCell>{item.nama}</TableCell>
                  <TableCell>{item.kategori ?? "-"}</TableCell>
                  <TableCell className="text-right tabular-nums">{item.rataRata}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Skor per Responden</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>NIK</TableHead>
                <TableHead className="text-right">Skor</TableHead>
                <TableHead>Klasifikasi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {perResponden.map((item) => (
                <TableRow key={item.respondenId}>
                  <TableCell className="font-medium">{item.nama ?? "-"}</TableCell>
                  <TableCell>{"-" /* NIK tidak tersedia di SkorResponden */}</TableCell>
                  <TableCell className="text-right tabular-nums">{item.skor}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.klasifikasi}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
