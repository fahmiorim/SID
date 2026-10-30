import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseKonfigTte } from "@/features/surat/domain/tte";

export const metadata = { title: "TTE / BSrE" };

export default function TtePage() {
  const config = parseKonfigTte(process.env);

  const modeLabel =
    config.mode === "bsre" ? "BSrE (api)" : config.mode === "manual" ? "Manual" : "Nonaktif";

  return (
    <div className="space-y-6">
      <PageHeader
        title="TTE / BSrE"
        description="Konfigurasi penandatanganan elektronik (scaffolding)"
      />
      <Card>
        <CardHeader>
          <CardTitle>Status konfigurasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Mode</span>
            <span className="font-medium">{modeLabel}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">API BSrE</span>
            <span className="font-mono text-xs">{config.api || "-"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Username</span>
            <span className="font-mono text-xs">{config.username || "-"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">SSL verifikasi</span>
            <span>{config.ssl ? "Aktif" : "Nonaktif"}</span>
          </div>
          <p className="pt-2 text-xs text-muted-foreground">
            Atur via environment: <code>TTE_MODE</code>, <code>TTE_API</code>,{" "}
            <code>TTE_USERNAME</code>, <code>TTE_PASSWORD</code>, <code>TTE_SSL</code>. Mode{" "}
            <code>bsre</code> memerlukan kredensial lengkap; saat ini klien jaringan belum
            diimplementasi sehingga penerbitan surat tetap berjalan tanpa TTE.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
