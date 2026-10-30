import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ringkasanIdmPublik } from "@/features/idm/application/idm-use-cases";
import { formatSkor, hitungRekapIdm } from "@/features/idm/domain/idm";

export const metadata = { title: "Indeks Desa Membangun (IDM)" };
export const dynamic = "force-dynamic";

export default async function IdmPage() {
  const identitas = await import("@/features/desa/application/resolve-village").then((m) =>
    m.getIdentitasFromRequest(),
  );
  const desaInfo = await identitas;
  const _desa = await import("server-only"); // suppression
  const villageId = desaInfo.id;

  const { tahun, indikator } = await ringkasanIdmPublik(villageId);
  const rekap = hitungRekapIdm(indikator);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Indeks Desa Membangun (IDM)"
        description={`Capaian IDM ${desaInfo.namaDesa ?? "Desa"} tahun ${tahun}`}
      />

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

      <div className="mt-4 text-sm text-muted-foreground">
        <p>Tahun: {tahun}</p>
        <p>Total indikator: {indikator.length}</p>
      </div>
    </div>
  );
}
