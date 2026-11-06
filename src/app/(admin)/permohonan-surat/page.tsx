import { ClipboardList, Download, Inbox } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  labelPermohonanStatus,
  PERMOHONAN_STATUS,
  type PermohonanStatus,
} from "@/features/layanan-mandiri/domain/layanan-mandiri";
import { getLayananMandiriData } from "@/features/layanan-mandiri/presentation/actions";
import { PermohonanDetailButton } from "@/features/layanan-mandiri/presentation/components/permohonan-detail-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Permohonan Surat" };

function badgeVariant(status: number): "default" | "secondary" | "outline" | "destructive" {
  if (status === 3) return "default";
  if (status === 4) return "outline";
  if (status === 0 || status === 5) return "destructive";
  return "secondary";
}

function toStatus(value: string | undefined): PermohonanStatus | null {
  if (!value) return null;
  return (PERMOHONAN_STATUS as readonly string[]).includes(value)
    ? (value as PermohonanStatus)
    : null;
}

function tanggalValid(value: string | undefined): string | undefined {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

function angkaPositif(value: string | undefined): number | undefined {
  if (!value || !/^\d+$/.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export default async function PermohonanSuratPage({
  searchParams,
}: PageProps<"/permohonan-surat">) {
  const params = await searchParams;
  const status = toStatus(typeof params.status === "string" ? params.status : undefined);
  const dari = tanggalValid(typeof params.dari === "string" ? params.dari : undefined);
  const sampai = tanggalValid(typeof params.sampai === "string" ? params.sampai : undefined);
  const typeId = angkaPositif(typeof params.jenis === "string" ? params.jenis : undefined);

  const { permohonan, rekapJenis, jenis, canManage } = await getLayananMandiriData({
    dari,
    sampai,
    typeId,
    status: status ? Number(status) : undefined,
  });

  const filtered = permohonan;
  const hitung = (nilai: number) => permohonan.filter((item) => item.status === nilai).length;

  const query = new URLSearchParams();
  if (dari) query.set("dari", dari);
  if (sampai) query.set("sampai", sampai);
  if (typeId) query.set("jenis", String(typeId));
  if (status) query.set("status", status);

  const hrefDengan = (perubahan: { status?: PermohonanStatus | null }) => {
    const next = new URLSearchParams(query);
    if (perubahan.status) next.set("status", perubahan.status);
    else next.delete("status");
    const teks = next.toString();
    return `/permohonan-surat${teks ? `?${teks}` : ""}`;
  };

  const exportHref = `/permohonan-surat/ekspor${query.toString() ? `?${query.toString()}` : ""}`;
  const adaFilter = Boolean(dari || sampai || typeId || status);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Permohonan Surat"
        description="Periksa permohonan warga, buat konsep surat, dan pantau status penerbitannya."
        actions={
          <Button variant="outline" asChild>
            <a href={exportHref}>
              <Download className="size-4" />
              Ekspor CSV
            </a>
          </Button>
        }
      />

      <form method="get" className="flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <label htmlFor="dari" className="text-xs text-muted-foreground">
            Dari tanggal
          </label>
          <Input id="dari" name="dari" type="date" defaultValue={dari} className="w-40" />
        </div>
        <div className="space-y-1">
          <label htmlFor="sampai" className="text-xs text-muted-foreground">
            Sampai tanggal
          </label>
          <Input id="sampai" name="sampai" type="date" defaultValue={sampai} className="w-40" />
        </div>
        <div className="space-y-1">
          <label htmlFor="jenis" className="text-xs text-muted-foreground">
            Jenis surat
          </label>
          <select
            id="jenis"
            name="jenis"
            defaultValue={typeId ? String(typeId) : ""}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="">Semua jenis</option>
            {jenis.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nama}
              </option>
            ))}
          </select>
        </div>
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <Button type="submit" variant="outline">
          Terapkan
        </Button>
        {adaFilter ? (
          <Button type="button" variant="ghost" asChild>
            <Link href="/permohonan-surat">Reset</Link>
          </Button>
        ) : null}
      </form>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(["0", "1", "2", "3", "4", "5"] as const).map((item) => (
          <Link
            key={item}
            href={hrefDengan({ status: item === status ? null : item })}
            className={`rounded-lg border p-4 transition-colors hover:bg-accent/40 ${
              item === status ? "bg-accent/50" : "bg-card"
            }`}
          >
            <p className="text-sm text-muted-foreground">{labelPermohonanStatus(Number(item))}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{hitung(Number(item))}</p>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rekap per Jenis Surat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jenis surat</TableHead>
                  <TableHead className="w-24 text-right">Total</TableHead>
                  <TableHead className="w-28 text-right">Menunggu</TableHead>
                  <TableHead className="w-24 text-right">Selesai</TableHead>
                  <TableHead className="w-28 text-right">Dibatalkan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rekapJenis.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                      Belum ada permohonan pada filter ini.
                    </TableCell>
                  </TableRow>
                ) : (
                  rekapJenis.map((row) => (
                    <TableRow key={row.jenis}>
                      <TableCell className="font-medium">{row.jenis}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.total}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.menunggu}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.selesai}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.dibatalkan}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Inbox className="size-4" />
              {status
                ? `Menampilkan ${labelPermohonanStatus(Number(status))}`
                : "Seluruh riwayat permohonan"}
              <span className="tabular-nums">({filtered.length})</span>
            </div>
            {status ? (
              <Link
                href={hrefDengan({ status: null })}
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                Tampilkan semua status
              </Link>
            ) : null}
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-36">No. Antrian</TableHead>
                  <TableHead>Pemohon</TableHead>
                  <TableHead>Surat</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="w-24 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      <ClipboardList className="mx-auto mb-2 size-5" />
                      Belum ada permohonan pada filter ini.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs">{item.noAntrian || "—"}</TableCell>
                      <TableCell>
                        <p className="font-medium">{item.namaPemohon || "—"}</p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {item.nikPemohon || "—"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p>{item.namaSurat || "—"}</p>
                        {item.letterNumber ? (
                          <p className="text-xs text-muted-foreground">{item.letterNumber}</p>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <Badge variant={badgeVariant(item.status)}>
                          {labelPermohonanStatus(item.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString("id-ID", {
                              dateStyle: "medium",
                            })
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <PermohonanDetailButton permohonan={item} canManage={canManage} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
