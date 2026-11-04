import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Plugin" };

/**
 * Halaman status integrasi pihak ketiga.
 *
 * Registri plugin belum diimplementasikan. Jangan menampilkan plugin sebagai
 * "aktif" di sini: modul bawaan (GIS, lapak, buku tamu, dst.) bukan plugin dan
 * integrasi yang berjalan dikonfigurasi lewat environment masing-masing.
 */
const rencanaIntegrasi = [
  {
    nama: "SMS Gateway",
    deskripsi: "Notifikasi SMS untuk warga dan operator",
  },
  {
    nama: "WhatsApp Gateway",
    deskripsi: "Notifikasi WhatsApp untuk warga",
  },
  {
    nama: "Email SMTP",
    deskripsi: "Server email kustom (saat ini email pengaduan memakai Resend)",
  },
];

export default function PluginPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Plugin & Modul Tambahan" description="Status integrasi pihak ketiga" />
      <Card>
        <CardHeader>
          <CardTitle>Registri plugin belum tersedia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Instalasi, aktivasi, dan konfigurasi plugin belum diimplementasikan. Daftar di bawah
            hanya rencana integrasi; tidak ada plugin yang dapat diaktifkan dari halaman ini.
          </p>
          <div className="space-y-3">
            {rencanaIntegrasi.map((item) => (
              <div
                key={item.nama}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{item.nama}</p>
                  <p className="text-sm text-muted-foreground">{item.deskripsi}</p>
                </div>
                <Badge variant="secondary">Belum tersedia</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
