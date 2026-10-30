import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Sinkronisasi" };

type SyncConfig = { nama: string; endpoint: string; status: "aktif" | "belum-dikonfigurasi" };
type SyncLog = { waktu: string; modul: string; status: "berhasil" | "gagal"; detail: string };

const syncConfigs: SyncConfig[] = [
  {
    nama: "OpenDK / SID Nasional",
    endpoint: "https://sid.kemendesa.go.id/api",
    status: "belum-dikonfigurasi",
  },
  {
    nama: "Data Penduduk (Dukcapil)",
    endpoint: "https://dukcapil.kemendagri.go.id/api",
    status: "belum-dikonfigurasi",
  },
  {
    nama: "Data Wilayah (Kode Wilayah)",
    endpoint: "https://kodewilayah.kemendagri.go.id/api",
    status: "belum-dikonfigurasi",
  },
];

const syncLogs: SyncLog[] = [
  {
    waktu: "2026-10-15 08:30:00",
    modul: "Data Penduduk",
    status: "berhasil",
    detail: "Sinkronisasi 1.245 data penduduk",
  },
  {
    waktu: "2026-10-14 08:30:00",
    modul: "Data Penduduk",
    status: "berhasil",
    detail: "Sinkronisasi 1.240 data penduduk",
  },
  {
    waktu: "2026-10-10 14:22:00",
    modul: "Kode Wilayah",
    status: "gagal",
    detail: "Timeout koneksi ke server pusat",
  },
];

export default function SinkronisasiPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Sinkronisasi Data"
        description="Konfigurasi dan log sinkronisasi dengan sistem eksternal"
      />

      <Card>
        <CardHeader>
          <CardTitle>Konfigurasi Sinkronisasi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {syncConfigs.map((cfg) => (
              <div
                key={cfg.nama}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{cfg.nama}</p>
                  <p className="font-mono text-sm text-muted-foreground">{cfg.endpoint}</p>
                </div>
                <Badge variant={cfg.status === "aktif" ? "default" : "secondary"}>
                  {cfg.status.replace("-", " ")}
                </Badge>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Atur endpoint, API key, dan jadwal sinkronisasi melalui environment variables.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Log Sinkronisasi Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {syncLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada log sinkronisasi.</p>
          ) : (
            <div className="space-y-2">
              {syncLogs.map((log, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{log.modul}</span>
                      <Badge variant={log.status === "berhasil" ? "default" : "destructive"}>
                        {log.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{log.detail}</p>
                  </div>
                  <span className="font-mono text-sm text-muted-foreground">{log.waktu}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
