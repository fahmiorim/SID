import { ArrowRight, FileText, FolderOpen, MessageSquare, UserRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listPermohonanWargaData } from "@/features/layanan-mandiri/application/warga-use-cases";
import { labelPermohonanStatus } from "@/features/layanan-mandiri/domain/layanan-mandiri";
import { getProfilWargaData } from "@/features/warga/application/warga-use-cases";
import { verifyWargaPage } from "@/lib/dal";

export const metadata: Metadata = { title: "Beranda Layanan Warga" };

function badgeVariant(status: number): "default" | "secondary" | "outline" | "destructive" {
  if (status === 3) return "default";
  if (status === 4) return "outline";
  if (status === 0 || status === 5) return "destructive";
  return "secondary";
}

export default async function BerandaWargaPage() {
  await verifyWargaPage();
  const [profil, permohonan] = await Promise.all([getProfilWargaData(), listPermohonanWargaData()]);

  const terbaru = permohonan.slice(0, 3);
  const selesai = permohonan.filter((item) => item.status === 3 || item.status === 4).length;
  const diproses = permohonan.filter((item) => item.status === 1 || item.status === 2).length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Selamat datang,</p>
        <h1 className="text-2xl font-semibold tracking-tight">{profil.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          NIK {profil.nationalId ?? "—"} ·{" "}
          {profil.familyNumber ? `KK ${profil.familyNumber}` : "KK belum tertaut"}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total permohonan</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{permohonan.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sedang diproses</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{diproses}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Surat siap/ambil</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{selesai}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>Permohonan terbaru</CardTitle>
            <CardDescription>Pantau status pengajuan surat Anda.</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/layanan-mandiri/surat">Ajukan surat</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {terbaru.length === 0 ? (
            <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              Belum ada permohonan. Pilih jenis surat untuk memulai.
            </p>
          ) : (
            <ul className="divide-y">
              {terbaru.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center gap-2 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.namaSurat ?? "Surat"}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.noAntrian ?? "—"} ·{" "}
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString("id-ID") : "—"}
                    </p>
                  </div>
                  <Badge variant={badgeVariant(item.status)}>
                    {labelPermohonanStatus(item.status)}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/layanan-mandiri/surat", label: "Ajukan Surat", icon: FileText },
          { href: "/layanan-mandiri/dokumen", label: "Dokumen Saya", icon: FolderOpen },
          { href: "/layanan-mandiri/pesan", label: "Pesan", icon: MessageSquare },
          { href: "/layanan-mandiri/profil", label: "Profil", icon: UserRound },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-xl border bg-background p-4 transition-colors hover:bg-muted/50"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <item.icon className="size-4" />
            </span>
            <span className="flex-1 text-sm font-medium">{item.label}</span>
            <ArrowRight className="size-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
