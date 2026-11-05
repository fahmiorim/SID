import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getIdentitas } from "@/features/desa/application/get-identitas";
import { ambilShortcutBeranda } from "@/features/navigation/application/shortcut-use-cases";
import { ShortcutPicker } from "@/features/navigation/presentation/components/shortcut-picker";
import { verifySession } from "@/lib/dal";

export const dynamic = "force-dynamic";

export default async function BerandaPage() {
  const user = await verifySession();
  const desa = await getIdentitas();
  const { shortcut, tujuan } = await ambilShortcutBeranda(user);

  const namaDesa = desa?.namaDesa ?? "Desa";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Beranda"
        description={`Selamat datang, ${user.name}. Anda sedang mengelola ${namaDesa}.`}
      />

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Shortcut saya</h2>
          {tujuan.length > 0 ? (
            <ShortcutPicker pilihan={tujuan} terpilih={shortcut.map((item) => item.href)} />
          ) : null}
        </div>

        {shortcut.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shortcut.map((item) => (
              <Card key={item.href}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{item.label}</CardTitle>
                  <CardDescription>{item.href}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-end">
                  <Button asChild size="sm" variant="outline">
                    <Link href={item.href}>Buka</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Belum ada menu yang dapat dijadikan shortcut.
          </p>
        )}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Fondasi siap dikembangkan</CardTitle>
          <CardDescription>
            Arsitektur bersih (domain/application/infrastructure/presentation), RBAC terpusat,
            autentikasi better-auth, dan Drizzle ORM sudah terpasang.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
