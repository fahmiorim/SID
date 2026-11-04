import { KeyRound, PenTool } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hasPermission } from "@/features/rbac/application/authorization";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { getKonfigurasiTtePageData } from "@/features/surat/application/tte-use-cases";
import { TteForm } from "@/features/surat/presentation/components/tte-form";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = { title: "TTE / BSrE" };

const MODE_LABELS = {
  nonaktif: "Nonaktif",
  manual: "Manual",
  bsre: "BSrE (API)",
} as const;

export default async function TtePage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, RESOURCES.tte, "read")) {
    return <NoAccess title="TTE / BSrE" description="Konfigurasi tanda tangan elektronik." />;
  }

  const data = await getKonfigurasiTtePageData();
  const { tersimpan, efektif, masalah, passwordTersedia } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="TTE / BSrE"
        description="Konfigurasi penandatanganan elektronik untuk surat yang diterbitkan."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="size-4" />
            Status Konfigurasi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Mode tersimpan</span>
            <Badge variant={tersimpan.mode === "bsre" ? "default" : "secondary"}>
              {MODE_LABELS[tersimpan.mode]}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Mode efektif</span>
            <span className="font-medium">{MODE_LABELS[efektif.mode]}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Konfigurasi aktif</span>
            <span>{tersimpan.aktif ? "Ya" : "Tidak"}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">API BSrE</span>
            <span className="max-w-[60%] truncate font-mono text-xs">{tersimpan.api || "—"}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Username</span>
            <span className="font-mono text-xs">{tersimpan.username || "—"}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">NIK penanda tangan</span>
            <span className="font-mono text-xs">
              {tersimpan.nik ? `${tersimpan.nik.slice(0, 6)}••••••${tersimpan.nik.slice(-4)}` : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Passphrase server</span>
            <Badge variant={passwordTersedia ? "default" : "destructive"}>
              <KeyRound className="size-3" />
              {passwordTersedia ? "Tersedia" : "Belum diatur"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {data.canManage ? (
        <TteForm tersimpan={tersimpan} passwordTersedia={passwordTersedia} masalah={masalah} />
      ) : (
        <Alert>
          <AlertDescription>
            Anda hanya dapat melihat konfigurasi TTE. Hubungi operator yang berwenang untuk
            mengubahnya.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
