import { Inbox, MessagesSquare } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listPengaduanData } from "@/features/pengaduan/application/use-cases";
import {
  hitungStatistikPengaduan,
  KATEGORI_PENGADUAN,
  labelKategori,
  normalizeStatus,
  STATUS_PENGADUAN,
  type StatusPengaduan,
} from "@/features/pengaduan/domain/pengaduan";
import { PengaduanRowActions } from "@/features/pengaduan/presentation/components/pengaduan-row-actions";
import { hasPermission } from "@/features/rbac/application/authorization";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = { title: "Pengaduan Warga" };

function formatTanggal(value: Date | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("id-ID", { dateStyle: "medium" });
}

function badgeStatus(status: StatusPengaduan) {
  switch (status) {
    case "baru":
      return <Badge>Baru</Badge>;
    case "diproses":
      return <Badge variant="secondary">Diproses</Badge>;
    case "selesai":
      return <Badge variant="outline">Selesai</Badge>;
    default:
      return <Badge variant="destructive">Ditolak</Badge>;
  }
}

export default async function PengaduanPage({ searchParams }: PageProps<"/pengaduan">) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, RESOURCES.pengaduan, "read")) {
    return <NoAccess title="Pengaduan Warga" description="Pengaduan dan tanggapan petugas desa." />;
  }

  const params = await searchParams;
  const statusParam = typeof params.status === "string" ? params.status : "";
  const kategoriParam = typeof params.kategori === "string" ? params.kategori : "";
  const cari = typeof params.q === "string" ? params.q : "";

  const status =
    STATUS_PENGADUAN.some((item) => item.value === statusParam) && statusParam !== ""
      ? normalizeStatus(statusParam)
      : undefined;

  const [semua, daftar] = await Promise.all([
    listPengaduanData({}),
    listPengaduanData({
      status,
      kategori: kategoriParam || undefined,
      cari: cari || undefined,
    }),
  ]);

  const statistik = hitungStatistikPengaduan(semua);
  const canWrite = hasPermission(user.permissions, RESOURCES.pengaduan, "update");
  const canDelete = hasPermission(user.permissions, RESOURCES.pengaduan, "delete");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaduan Warga"
        description="Catat pengaduan dari situs desa, tanggapi, dan tentukan mana yang tampil publik."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">Total pengaduan</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{statistik.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">Belum ditangani</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{statistik.baru}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">Diproses</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{statistik.diproses}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">Selesai</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{statistik.selesai}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form className="flex flex-wrap items-end gap-3" method="get">
            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-xs text-muted-foreground">
                Status
              </Label>
              <Select name="status" defaultValue={statusParam || "semua"}>
                <SelectTrigger id="status" className="w-40">
                  <SelectValue placeholder="Semua status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua status</SelectItem>
                  {STATUS_PENGADUAN.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="kategori" className="text-xs text-muted-foreground">
                Kategori
              </Label>
              <Select name="kategori" defaultValue={kategoriParam || "semua"}>
                <SelectTrigger id="kategori" className="w-48">
                  <SelectValue placeholder="Semua kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua kategori</SelectItem>
                  {KATEGORI_PENGADUAN.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-56 flex-1 space-y-1.5">
              <Label htmlFor="q" className="text-xs text-muted-foreground">
                Cari
              </Label>
              <Input
                id="q"
                name="q"
                defaultValue={cari}
                placeholder="Nomor tiket, judul, atau nama pelapor"
              />
            </div>

            <Button type="submit" variant="outline">
              Terapkan
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="overflow-x-auto pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pengaduan</TableHead>
                <TableHead className="w-44">Kategori</TableHead>
                <TableHead className="w-44">Pelapor</TableHead>
                <TableHead className="w-28">Status</TableHead>
                <TableHead className="w-24">Publik</TableHead>
                <TableHead className="w-28">Tanggal</TableHead>
                <TableHead className="w-16 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {daftar.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-28 text-center text-muted-foreground">
                    <Inbox className="mx-auto mb-2 size-5" />
                    Belum ada pengaduan yang cocok dengan filter ini.
                  </TableCell>
                </TableRow>
              ) : (
                daftar.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <p className="font-medium">{item.judul}</p>
                      <p className="font-mono text-xs text-muted-foreground">{item.nomorTiket}</p>
                    </TableCell>
                    <TableCell className="text-sm">{labelKategori(item.kategori)}</TableCell>
                    <TableCell className="text-sm">
                      <p>{item.namaPelapor}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.telepon ?? item.email ?? "—"}
                      </p>
                    </TableCell>
                    <TableCell>{badgeStatus(item.status)}</TableCell>
                    <TableCell>
                      <Badge variant={item.publik ? "secondary" : "outline"}>
                        {item.publik ? "Tampil" : "Tersembunyi"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatTanggal(item.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <PengaduanRowActions
                        pengaduan={item}
                        canWrite={canWrite}
                        canDelete={canDelete}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-start gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        <MessagesSquare className="mt-0.5 size-4 shrink-0" />
        <p>
          Pengaduan masuk dari formulir publik <strong>/desa/pengaduan</strong>. Status dan
          tanggapan yang disimpan di sini langsung terlihat warga pada nomor tiket yang sama.
        </p>
      </div>
    </div>
  );
}
