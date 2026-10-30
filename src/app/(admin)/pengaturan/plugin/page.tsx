import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Plugin" };

const plugins = [
  {
    nama: "SMS Gateway",
    deskripsi: "Integrasi pengiriman SMS notifikasi",
    status: "nonaktif" as const,
  },
  {
    nama: "WhatsApp Gateway",
    deskripsi: "Integrasi pengiriman WA notifikasi",
    status: "nonaktif" as const,
  },
  {
    nama: "Email SMTP",
    deskripsi: "Konfigurasi server email untuk notifikasi",
    status: "nonaktif" as const,
  },
  { nama: "Peta GIS", deskripsi: "Modul pemetaan dan GIS desa", status: "aktif" as const },
  { nama: "Lapak UMKM", deskripsi: "Modul jual beli produk warga", status: "aktif" as const },
  {
    nama: "Buku Tamu Digital",
    deskripsi: "Pencatatan tamu desa elektronik",
    status: "aktif" as const,
  },
  {
    nama: "Anjungan Desa",
    deskripsi: "Tampilan anjungan mandiri layanan desa",
    status: "aktif" as const,
  },
  {
    nama: "Kehadiran Perangkat",
    deskripsi: "Absensi dan daftar hadir perangkat desa",
    status: "aktif" as const,
  },
];

export default function PluginPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Plugin & Modul Tambahan"
        description="Kelola plugin dan modul tambahan sistem"
      />
      <Card>
        <CardHeader>
          <CardTitle>Daftar Plugin</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {plugins.map((plugin) => (
              <div
                key={plugin.nama}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{plugin.nama}</p>
                  <p className="text-sm text-muted-foreground">{plugin.deskripsi}</p>
                </div>
                <Badge variant={plugin.status === "aktif" ? "default" : "secondary"}>
                  {plugin.status === "aktif" ? "Aktif" : "Nonaktif"}
                </Badge>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Konfigurasi plugin lanjutan (API key, endpoint, dll) dikelola melalui environment
            variables dan halaman pengaturan masing-masing modul.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
