import { BookOpen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Card, CardContent } from "@/components/ui/card";
import { getBumindesData } from "@/features/bumindes/presentation/actions";
import { hasPermission } from "@/features/rbac/application/authorization";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = { title: "Buku Administrasi Desa" };

export default async function BukuAdministrasiPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, RESOURCES.bumindes, "read")) {
    return <NoAccess title="Buku Administrasi" description="Buku administrasi desa." />;
  }

  const { buku } = await getBumindesData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buku Administrasi Desa"
        description="Buku-buku administrasi umum, penduduk, dan tanah desa."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {buku.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-10 text-center text-muted-foreground">
              Belum ada data buku administrasi.
            </CardContent>
          </Card>
        ) : (
          buku.map((item) => (
            <Link
              key={item.id}
              href={`/bumindes/buku-administrasi/${item.id}`}
              className="rounded-xl border bg-card p-4 transition-colors hover:bg-accent/40"
            >
              <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="font-medium">{item.namaBuku}</p>
                  <p className="text-xs text-muted-foreground">Kode: {item.kodeBuku}</p>
                  {item.uraian ? (
                    <p className="mt-1 text-sm text-muted-foreground">{item.uraian}</p>
                  ) : null}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
