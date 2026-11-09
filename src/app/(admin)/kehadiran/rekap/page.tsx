import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { getRekapKehadiranData } from "@/features/kehadiran/application/kehadiran-use-cases";
import { KEHADIRAN_RESOURCE } from "@/features/kehadiran/domain/kehadiran";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata = { title: "Rekap Kehadiran" };
export const dynamic = "force-dynamic";

export default async function RekapKehadiranPage({
  searchParams,
}: {
  searchParams: Promise<{ bulan?: string; tahun?: string }>;
}) {
  const user = await verifySession();
  if (!hasPermission(user.permissions, KEHADIRAN_RESOURCE, "read")) {
    notFound();
  }

  const params = await searchParams;
  const bulan = params.bulan ? Number(params.bulan) : undefined;
  const tahun = params.tahun ? Number(params.tahun) : new Date().getFullYear();

  if (!user.villageId) notFound();
  const villageId = user.villageId;
  const rekap = await getRekapKehadiranData(villageId, tahun, bulan);

  const hadirCount = rekap.reduce((sum, item) => sum + item.hadir, 0);
  const izinCount = rekap.reduce((sum, item) => sum + item.izin, 0);
  const sakitCount = rekap.reduce((sum, item) => sum + item.sakit, 0);
  const alpaCount = rekap.reduce((sum, item) => sum + item.alpa, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rekap Kehadiran Perangkat"
        description="Rekap bulanan kehadiran perangkat desa (hadir/izin/sakit/alpa)."
      />
      <form method="get" className="flex flex-col gap-2 sm:flex-row">
        <Input
          name="bulan"
          type="number"
          min={1}
          max={12}
          defaultValue={bulan ? String(bulan) : ""}
          placeholder="Bulan (1-12)"
          aria-label="Bulan"
          className="flex-1"
        />
        <Input
          name="tahun"
          type="number"
          defaultValue={tahun}
          placeholder="Tahun"
          aria-label="Tahun"
          className="flex-1"
        />
        <Button type="submit" variant="outline">
          Tampilkan
        </Button>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Total per Status</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-4 gap-2">
          <div>
            <Badge variant="default">{hadirCount}</Badge>
            <p className="text-xs text-muted-foreground">Hadir</p>
          </div>
          <div>
            <Badge variant="secondary">{izinCount}</Badge>
            <p className="text-xs text-muted-foreground">Izin</p>
          </div>
          <div>
            <Badge variant="secondary">{sakitCount}</Badge>
            <p className="text-xs text-muted-foreground">Sakit</p>
          </div>
          <div>
            <Badge variant="destructive">{alpaCount}</Badge>
            <p className="text-xs text-muted-foreground">Alpa</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rekap per Perangkat</CardTitle>
        </CardHeader>
        <CardContent>
          {rekap.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada data kehadiran untuk periode ini.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Perangkat</TableCell>
                  <TableCell>Jabatan</TableCell>
                  <TableCell className="text-right">Hadir</TableCell>
                  <TableCell className="text-right">Izin</TableCell>
                  <TableCell className="text-right">Sakit</TableCell>
                  <TableCell className="text-right">Alpa</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rekap.map((item) => (
                  <TableRow key={item.perangkatId}>
                    <TableCell>{item.nama ?? "-"}</TableCell>
                    <TableCell>{item.jabatan ?? "-"}</TableCell>
                    <TableCell className="text-right">{item.hadir}</TableCell>
                    <TableCell className="text-right">{item.izin}</TableCell>
                    <TableCell className="text-right">{item.sakit}</TableCell>
                    <TableCell className="text-right">{item.alpa}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ekspor CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <a href={`/kehadiran/rekap/ekspor?bulan=${bulan}&tahun=${tahun}`}>Download CSV</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
