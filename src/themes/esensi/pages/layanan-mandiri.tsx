import { ClipboardCheck, FileText, KeyRound, ShieldCheck } from "lucide-react";
import Link from "next/link";

import type { LayananMandiriProps } from "@/themes/types";
import { ThemeCard, ThemePageHeader } from "@/themes/ui";

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

/** Halaman informasi layanan mandiri warga (belum ada form masuk). */
export function EsensiLayananMandiri({ ctx }: LayananMandiriProps) {
  return (
    <div className="space-y-12">
      <div className="space-y-3">
        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
          style={{
            backgroundColor: "color-mix(in srgb, var(--pub-primary) 14%, transparent)",
            color: "var(--pub-primary)",
          }}
        >
          Untuk Warga
        </span>
        <ThemePageHeader
          title="Layanan Mandiri Warga"
          description={`Ajukan surat administrasi ${ctx.desa.namaDesa ?? "desa"} tanpa harus mengantre di kantor.`}
        />
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        {LANGKAH.map((item) => (
          <ThemeCard key={item.judul} className="space-y-2 p-5">
            <span className="flex size-9 items-center justify-center rounded-lg border">
              <item.icon className="size-4" />
            </span>
            <h2 className="text-base font-semibold">{item.judul}</h2>
            <p className="text-sm text-muted-foreground">{item.isi}</p>
          </ThemeCard>
        ))}
      </section>

      <section className="border bg-muted/40 p-6" style={{ borderRadius: "var(--pub-radius)" }}>
        <h2 className="text-lg font-semibold tracking-tight">Belum punya akun?</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Akun warga dibuat dan diaktifkan oleh operator desa — tidak ada pendaftaran mandiri.
          Silakan datang ke kantor desa dengan membawa KTP/KK untuk meminta NIK dan PIN Anda.
        </p>
        <div className="mt-5">
          <Link
            href="/desa/kontak"
            className="tema-link-primary text-sm font-medium underline-offset-4 hover:underline"
          >
            Hubungi Kantor Desa
          </Link>
        </div>
      </section>
    </div>
  );
}
