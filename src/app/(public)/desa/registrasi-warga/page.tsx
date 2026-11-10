import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { bacaPengaturan } from "@/features/pengaturan/application/pengaturan-use-cases";
import { RegistrasiWargaForm } from "@/features/registrasi-warga/presentation/components/registrasi-warga-form";
import { buatCaptcha } from "@/lib/captcha";
import { env } from "@/lib/env";
import { ThemeCard, ThemePageHeader } from "@/themes/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Registrasi Akun Layanan Mandiri",
  description: "Ajukan akun layanan mandiri warga desa",
};

export default async function RegistrasiWargaPublikPage() {
  const identitas = await getIdentitasFromRequest();
  if (!identitas?.id) notFound();

  const pengaturan = await bacaPengaturan(identitas.id);

  if (!pengaturan.pendaftaranWargaAktif) {
    return (
      <div className="max-w-xl space-y-4">
        <ThemePageHeader
          title="Pendaftaran Akun Ditutup"
          description={`Pengajuan akun layanan mandiri Desa ${identitas.namaDesa} sedang ditutup. Silakan menghubungi kantor desa untuk informasi lebih lanjut.`}
        />
        <Link
          href="/"
          className="inline-block text-sm text-[var(--pub-primary-text)] underline-offset-4 hover:underline"
        >
          Kembali ke beranda
        </Link>
      </div>
    );
  }

  const captcha = buatCaptcha(env.BETTER_AUTH_SECRET);

  return (
    <div className="max-w-xl space-y-6">
      <ThemePageHeader
        title="Registrasi Akun Layanan Mandiri"
        description={`Desa ${identitas.namaDesa}. Ajukan akun untuk mengakses layanan surat dan dokumen secara mandiri.`}
        eyebrow="Layanan Warga"
      />

      <ThemeCard className="p-6">
        <RegistrasiWargaForm captchaPertanyaan={captcha.pertanyaan} captchaToken={captcha.token} />
      </ThemeCard>

      <p className="text-sm text-muted-foreground">
        Sudah memiliki akun?{" "}
        <Link
          href="/masuk"
          className="text-[var(--pub-primary-text)] underline-offset-4 hover:underline"
        >
          Masuk di sini
        </Link>
        .
      </p>
    </div>
  );
}
