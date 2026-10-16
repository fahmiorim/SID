import { ShieldX } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

/** Tampilan saat pengguna tidak memiliki izin membaca sebuah modul. */
export function NoAccess({ title, description }: { title: string; description?: string }) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />

      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-full border border-border">
            <ShieldX className="size-5 text-muted-foreground" />
          </div>
          <CardTitle className="text-base">Akses ditolak</CardTitle>
          <CardDescription className="max-w-md">
            Anda tidak memiliki hak akses untuk membuka modul ini. Hubungi administrator desa
            apabila Anda merasa ini sebuah kekeliruan.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
