import { Puzzle } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { daftarPluginAdmin } from "@/features/plugin/application/plugin-use-cases";
import { PluginToggle } from "@/features/plugin/presentation/components/plugin-toggle";
import { hasPermission } from "@/features/rbac/application/authorization";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = { title: "Plugin" };
export const dynamic = "force-dynamic";

export default async function PluginPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, RESOURCES.plugin, "read")) {
    return (
      <NoAccess
        title="Plugin"
        description="Registri integrasi pihak ketiga yang tersedia pada instalasi ini."
      />
    );
  }

  const plugins = await daftarPluginAdmin();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plugin & Modul Tambahan"
        description="Plugin berasal dari manifest build-time; tidak ada unggahan atau eksekusi kode saat runtime."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {plugins.map((plugin) => (
          <Card key={plugin.slug}>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Puzzle className="size-4" />
                  {plugin.nama}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{plugin.deskripsi}</p>
              </div>
              <Badge variant={plugin.aktif ? "default" : "secondary"}>
                {plugin.aktif ? "Aktif" : "Nonaktif"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-mono text-xs text-muted-foreground">{plugin.slug}</p>

              <div className="text-sm">
                {plugin.envKurang.length === 0 ? (
                  <p className="text-muted-foreground">Semua environment wajib sudah terisi.</p>
                ) : (
                  <p className="text-amber-600 dark:text-amber-500">
                    Environment belum terisi: {plugin.envKurang.join(", ")}
                  </p>
                )}
              </div>

              <PluginToggle slug={plugin.slug} aktif={plugin.aktif} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
