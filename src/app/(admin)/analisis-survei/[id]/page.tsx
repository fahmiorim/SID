import { ArrowLeft, BarChart3, MessageSquareText, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hasPermission } from "@/features/rbac/application/authorization";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { getSurveyDetailData } from "@/features/survey/application/use-cases";
import { TIPE_SOAL_LABELS, type RekapSoal } from "@/features/survey/domain/survey";
import { RespondenCreateButton } from "@/features/survey/presentation/components/responden-create-button";
import { RespondenRowActions } from "@/features/survey/presentation/components/responden-row-actions";
import { SoalCreateButton } from "@/features/survey/presentation/components/soal-create-button";
import { SoalRowActions } from "@/features/survey/presentation/components/soal-row-actions";
import { SurveyEditButton } from "@/features/survey/presentation/components/survey-edit-button";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = { title: "Detail Survei" };

function RekapBadge({ rekap }: { rekap: RekapSoal }) {
  return (
    <Badge variant="secondary">
      {rekap.dijawab} dijawab · {TIPE_SOAL_LABELS[rekap.tipe]}
    </Badge>
  );
}

function RekapIsi({ rekap }: { rekap: RekapSoal }) {
  if (rekap.tipe === "choice") {
    return (
      <div className="space-y-2">
        {rekap.distribusi.map((item) => (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span>{item.label}</span>
              <span className="text-muted-foreground tabular-nums">
                {item.jumlah} ({item.persentase}%)
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(100, item.persentase)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (rekap.tipe === "number") {
    return (
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Rata-rata</p>
          <p className="text-lg font-semibold tabular-nums">{rekap.rataRata ?? "—"}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Terkecil</p>
          <p className="text-lg font-semibold tabular-nums">{rekap.terkecil ?? "—"}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Terbesar</p>
          <p className="text-lg font-semibold tabular-nums">{rekap.terbesar ?? "—"}</p>
        </div>
      </div>
    );
  }

  return rekap.jawabanTeks.length === 0 ? (
    <p className="text-sm text-muted-foreground">Belum ada jawaban.</p>
  ) : (
    <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
      {rekap.jawabanTeks.map((jawaban, index) => (
        <li key={`${index}-${jawaban}`}>{jawaban}</li>
      ))}
    </ul>
  );
}

export default async function SurveyDetailPage({ params }: PageProps<"/analisis-survei/[id]">) {
  const { id } = await params;
  const surveyId = Number(id);

  if (!Number.isInteger(surveyId) || surveyId < 1) notFound();

  const user = await verifySession();

  if (!hasPermission(user.permissions, RESOURCES.analisisSurvei, "read")) {
    return <NoAccess title="Analisis & Survei" description="Survei warga dan rekap jawabannya." />;
  }

  const detail = await getSurveyDetailData(surveyId);
  if (!detail) notFound();

  const { survei, soal, responden, rekap, urutanBerikutnya } = detail;
  const canWrite = hasPermission(user.permissions, RESOURCES.analisisSurvei, "update");
  const canDelete = hasPermission(user.permissions, RESOURCES.analisisSurvei, "delete");

  return (
    <div className="space-y-6">
      <PageHeader
        title={survei.judul}
        description={survei.deskripsi ?? "Survei warga desa."}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/analisis-survei">
                <ArrowLeft className="size-4" />
                Kembali
              </Link>
            </Button>
            {canWrite ? <SurveyEditButton survey={survei} /> : null}
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <MessageSquareText className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Pertanyaan</p>
              <p className="text-2xl font-semibold tabular-nums">{soal.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <Users className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Responden</p>
              <p className="text-2xl font-semibold tabular-nums">{responden.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <BarChart3 className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={survei.aktif ? "default" : "outline"}>
                {survei.aktif ? "Aktif di situs publik" : "Nonaktif"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">Pertanyaan</CardTitle>
              <CardDescription>Urutan pertanyaan saat diisi responden.</CardDescription>
            </div>
            {canWrite ? (
              <SoalCreateButton surveyId={survei.id} urutanAwal={urutanBerikutnya} />
            ) : null}
          </CardHeader>
          <CardContent>
            {soal.length === 0 ? (
              <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                Belum ada pertanyaan. Tambahkan minimal satu sebelum mengisi responden.
              </p>
            ) : (
              <ol className="divide-y">
                {soal.map((item, index) => (
                  <li key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="text-sm font-medium text-muted-foreground tabular-nums">
                      {index + 1}.
                    </span>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-sm font-medium">{item.pertanyaan}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{TIPE_SOAL_LABELS[item.tipe]}</Badge>
                        {item.tipe === "choice" ? (
                          <span className="text-xs text-muted-foreground">
                            {item.pilihan.join(" · ")}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    {canWrite ? (
                      <SoalRowActions
                        soal={item}
                        urutanAwal={urutanBerikutnya}
                        canDelete={canDelete}
                      />
                    ) : null}
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">Responden</CardTitle>
              <CardDescription>Jawaban dicatat operator dari warga.</CardDescription>
            </div>
            {canWrite ? <RespondenCreateButton surveyId={survei.id} soal={soal} /> : null}
          </CardHeader>
          <CardContent>
            {responden.length === 0 ? (
              <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                Belum ada responden.
              </p>
            ) : (
              <ul className="divide-y">
                {responden.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.nama ?? "Tanpa nama"}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.nik ?? "Tanpa NIK"} · {item.jumlahJawaban} jawaban
                      </p>
                    </div>
                    <RespondenRowActions
                      surveyId={survei.id}
                      responden={item}
                      canDelete={canDelete}
                    />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rekap Jawaban</CardTitle>
          <CardDescription>
            {responden.length === 0
              ? "Rekap muncul setelah responden pertama disimpan."
              : `Dihitung dari ${responden.length} responden.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {rekap.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada pertanyaan untuk direkap.</p>
          ) : (
            rekap.map((item) => (
              <div
                key={item.soalId}
                className="space-y-2 border-t pt-4 first:border-t-0 first:pt-0"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-sm font-medium">{item.pertanyaan}</p>
                  <RekapBadge rekap={item} />
                </div>
                <RekapIsi rekap={item} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
