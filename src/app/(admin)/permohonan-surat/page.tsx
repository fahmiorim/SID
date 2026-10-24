import { ClipboardList, Inbox } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
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
import {
  labelPermohonanStatus,
  PERMOHONAN_STATUS,
  type PermohonanStatus,
} from "@/features/layanan-mandiri/domain/layanan-mandiri";
import { getLayananMandiriData } from "@/features/layanan-mandiri/presentation/actions";
import { PermohonanDetailButton } from "@/features/layanan-mandiri/presentation/components/permohonan-detail-button";

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

export default async function PermohonanSuratPage({
  searchParams,
}: PageProps<"/permohonan-surat">) {
  const params = await searchParams;
  const status = toStatus(typeof params.status === "string" ? params.status : undefined);
  const { permohonan, canManage } = await getLayananMandiriData();

  const filtered = status
    ? permohonan.filter((item) => String(item.status) === status)
    : permohonan;
  const hitung = (nilai: number) => permohonan.filter((item) => item.status === nilai).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Permohonan Surat"
        description="Periksa permohonan warga, buat konsep surat, dan pantau status penerbitannya."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(["0", "1", "2", "3", "4", "5"] as const).map((item) => (
          <Link
            key={item}
            href={item === status ? "/permohonan-surat" : `/permohonan-surat?status=${item}`}
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
                href="/permohonan-surat"
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                Tampilkan semua
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
