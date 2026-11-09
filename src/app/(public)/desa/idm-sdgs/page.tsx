import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { ringkasanIdmPublik } from "@/features/idm/application/idm-use-cases";
import {
  formatSkor,
  hitungRekapIdm,
  hitungRekapSdgs,
  SDGS_RESOURCE,
} from "@/features/idm/domain/idm";
import { SdgsTable } from "@/features/idm/presentation/components/sdgs-table";
import { hasPermission } from "@/features/rbac/application/authorization";
import { getCurrentUser } from "@/lib/dal";

export const metadata = { title: "IDM & SDGs Desa" };
export const dynamic = "force-dynamic";

export default async function IdmSdgsPage({
  searchParams,
}: {
  searchParams: Promise<{ tahun?: string }>;
}) {
  // Detect admin session (if any). `getCurrentUser` returns null when
  // unauthenticated, so the public page stays safe without a session.
  const user = await getCurrentUser();
  const isAdmin = Boolean(user && hasPermission(user.permissions, SDGS_RESOURCE, "read"));

  const desa = await getIdentitasFromRequest();
  const villageId = isAdmin && user?.villageId ? user.villageId : desa.id;
  const params = await searchParams;
  const tahunParam = Number(params.tahun ?? "");
  const tahunDiminta = Number.isInteger(tahunParam) && tahunParam > 2000 ? tahunParam : undefined;
  const { tahun, indikator, sdgs } = await ringkasanIdmPublik(villageId, tahunDiminta);
  const rekap = hitungRekapIdm(indikator);
  const rekapSdgs = hitungRekapSdgs(sdgs);

  // Public view only shows the empty state when there is no data at all.
  const kosong = indikator.length === 0 && sdgs.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAdmin ? "Capaian SDGs Desa" : "Indeks Desa Membangun (IDM) & SDGs"}
        description={
          isAdmin
            ? `Daftar 18 tujuan SDGs Desa tahun ${tahun}`
            : `Capaian IDM dan SDGs ${desa.namaDesa ?? "Desa"} tahun ${tahun}`
        }
      />

      {kosong && !isAdmin ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Belum ada data IDM/SDGs yang dipublikasikan untuk tahun {tahun}.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Skor IDM</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold tabular-nums">
                {rekap.skor !== null ? formatSkor(rekap.skor) : "—"}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Status IDM</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold">{rekap.status ?? "—"}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Skor rata‑rata SDGs</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold tabular-nums">
                {rekapSdgs.skor !== null ? (rekapSdgs.skor * 100).toFixed(1) : "—"} %
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Predikat SDGs</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold">{rekapSdgs.predikat ?? "—"}</CardContent>
            </Card>
          </div>

          <SdgsTable rows={sdgs} tahun={tahun} canManage={isAdmin} />
        </>
      )}
    </div>
  );
}
