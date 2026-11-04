import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Notifikasi" };

export default function NotifikasiPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Notifikasi" description="Pusat notifikasi, mailbox, dan SMS/WhatsApp" />
      <Card>
        <CardContent className="space-y-3 py-10 text-center text-sm text-muted-foreground">
          <p className="text-base font-medium text-foreground">Pusat notifikasi belum tersedia.</p>
          <p>
            Email status pengaduan sudah dikirim melalui Resend. Mailbox, SMS, dan WhatsApp belum
            diimplementasikan, sehingga halaman ini tidak menampilkan data atau konfigurasi.
          </p>
          <Link className="underline underline-offset-4 hover:text-foreground" href="/beranda">
            Kembali ke beranda
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
