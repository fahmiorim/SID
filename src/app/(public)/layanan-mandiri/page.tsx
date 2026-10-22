import { ClipboardCheck, FileText, KeyRound, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";

export const dynamic = "force-dynamic";

export const metadata = { title: "Layanan Mandiri Warga" };

const LANGKAH = [
  {
    icon: KeyRound,
    judul: "Masuk dengan NIK & PIN",
    isi: "Gunakan NIK dan PIN 6 digit yang diberikan operator desa. Tidak perlu mendaftar sendiri.",
  },
  {
    icon: FileText,
    judul: "Pilih jenis surat",
    isi: "Lihat daftar surat yang tersedia beserta syarat yang perlu disiapkan.",
  },
  {
    icon: ClipboardCheck,
    judul: "Ajukan & pantau",
    isi: "Pantau status permohonan: diajukan, diverifikasi, hingga surat terbit.",
  },
  {
    icon: ShieldCheck,
    judul: "Ambil atau unduh surat",
    isi: "Surat yang sudah terbit dapat diunduh atau diambil di kantor desa.",
  },
] as const;

export default async function LayananMandiriPage() {
  const desa = await getIdentitasFromRequest();

  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Untuk Warga
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Layanan Mandiri Warga</h1>
        <p className="max-w-2xl text-muted-foreground">
          Ajukan surat administrasi {desa.namaDesa ?? "desa"} tanpa harus mengantre di kantor.
          Layanan ini siap dipakai setelah akun Anda diaktifkan operator desa.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {LANGKAH.map((item) => (
          <Card key={item.judul}>
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <span className="flex size-9 items-center justify-center rounded-lg border">
                <item.icon className="size-4" />
              </span>
              <CardTitle className="text-base">{item.judul}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.isi}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="rounded-xl border bg-muted/40 p-6">
        <h2 className="text-lg font-semibold tracking-tight">Belum punya akun?</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Akun warga dibuat dan diaktifkan oleh operator desa — tidak ada pendaftaran mandiri.
          Silakan datang ke kantor desa dengan membawa KTP/KK untuk meminta NIK dan PIN Anda.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button disabled>Masuk Layanan Mandiri</Button>
          <Button asChild variant="outline">
            <Link href="/desa/kontak">Hubungi Kantor Desa</Link>
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Form masuk NIK + PIN akan tersedia pada tahap berikutnya.
        </p>
      </section>
    </div>
  );
}
