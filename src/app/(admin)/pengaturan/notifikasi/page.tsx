import type { Metadata } from "next";
import Link from "next/link";

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
import { daftarNotifikasiAdmin } from "@/features/notifikasi/application/notifikasi-use-cases";
import { parseFilterNotifikasi } from "@/features/notifikasi/domain/notifikasi";
import { BroadcastForm } from "@/features/notifikasi/presentation/components/broadcast-form";
import { hasPermission } from "@/features/rbac/application/authorization";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = { title: "Notifikasi" };
export const dynamic = "force-dynamic";

function formatTanggal(value: Date): string {
  return new Date(value).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

function statusBadge(row: { sukses: boolean; dilewati: boolean }) {
  if (row.dilewati) return <Badge variant="secondary">Dilewati</Badge>;
  if (row.sukses) return <Badge>Sukses</Badge>;
  return <Badge variant="destructive">Gagal</Badge>;
}

export default async function NotifikasiPage({
  searchParams,
}: PageProps<"/pengaturan/notifikasi">) {
  const user = await verifySession();

  if (!hasPermission(user.permissions, RESOURCES.notifikasi, "read")) {
    return (
      <NoAccess
        title="Notifikasi"
        description="Riwayat dan pengiriman notifikasi email/WhatsApp desa."
      />
    );
  }

  const params = await searchParams;
  const filter = parseFilterNotifikasi({ kanal: params.kanal, status: params.status });
  const { baris, ringkasan } = await daftarNotifikasiAdmin(filter);

  const kanalTerpilih = filter.kanal ?? "";
  const tautan = (kanal: string) => {
    const query = new URLSearchParams();
    if (kanal) query.set("kanal", kanal);
    if (filter.status !== "semua") query.set("status", filter.status);
    const suffix = query.toString();
    return suffix ? `/pengaturan/notifikasi?${suffix}` : "/pengaturan/notifikasi";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifikasi"
        description="Riwayat pengiriman email/WhatsApp dan pengiriman manual."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total percobaan", nilai: ringkasan.total },
          { label: "Sukses", nilai: ringkasan.sukses },
          { label: "Gagal", nilai: ringkasan.gagal },
          { label: "Dilewati", nilai: ringkasan.dilewati },
        ].map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{item.nilai}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <BroadcastForm />

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle>Riwayat notifikasi</CardTitle>
          <div className="flex gap-2 text-sm">
            {["", "email", "whatsapp"].map((kanal) => (
              <Button
                key={kanal || "semua"}
                asChild
                size="sm"
                variant={kanalTerpilih === kanal ? "default" : "outline"}
              >
                <Link href={tautan(kanal)}>
                  {kanal === "" ? "Semua kanal" : kanal === "email" ? "Email" : "WhatsApp"}
                </Link>
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Kanal</TableHead>
                <TableHead>Tujuan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {baris.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-28 text-center text-muted-foreground">
                    Belum ada notifikasi yang cocok dengan filter ini.
                  </TableCell>
                </TableRow>
              ) : (
                baris.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {formatTanggal(row.createdAt)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{row.jenis}</TableCell>
                    <TableCell className="capitalize">{row.kanal}</TableCell>
                    <TableCell className="max-w-48 truncate">{row.target}</TableCell>
                    <TableCell>{statusBadge(row)}</TableCell>
                    <TableCell className="max-w-64 text-xs text-muted-foreground">
                      {row.pesanError ?? row.subjek ?? "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
