import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Sinkronisasi" };

/**
 * Halaman status integrasi sinkronisasi.
 *
 * Sinkronisasi pusat/OpenDK belum diimplementasikan. Jangan menampilkan log
 * contoh sebagai log nyata: tidak ada antrean, kredensial, penjadwalan, maupun
 * eksekusi sinkronisasi di aplikasi ini.
 */
const rencanaIntegrasi = [
  {
    nama: "OpenDK / SID Nasional",
    deskripsi: "Sinkronisasi data desa dengan sistem pusat",
  },
  {
    nama: "Data Penduduk (Dukcapil)",
    deskripsi: "Pencocokan data penduduk dengan layanan pusat",
  },
  {
    nama: "Data Wilayah (Kode Wilayah)",
    deskripsi: "Pembaruan referensi kode wilayah",
  },
];

export default function SinkronisasiPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Sinkronisasi Data"
        description="Status integrasi dengan sistem eksternal"
      />

      <Card>
        <CardHeader>
          <CardTitle>Integrasi belum tersedia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Endpoint, kredensial, antrean, dan penjadwalan sinkronisasi belum diimplementasikan.
            Daftar di bawah hanya rencana integrasi, bukan konfigurasi yang aktif.
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

      <Card>
        <CardHeader>
          <CardTitle>Log Sinkronisasi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Belum ada log. Log akan muncul setelah integrasi sinkronisasi diimplementasikan.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
