import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { RegistrasiWargaForm } from "@/features/registrasi-warga/presentation/components/registrasi-warga-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Registrasi Akun Layanan Mandiri",
  description: "Ajukan akun layanan mandiri warga desa",
};

export default async function RegistrasiWargaPublikPage() {
  const identitas = await getIdentitasFromRequest();
  if (!identitas?.id) notFound();

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Registrasi Akun Layanan Mandiri</h1>
        <p className="text-sm text-muted-foreground">
          Desa {identitas.namaDesa}. Ajukan akun untuk mengakses layanan surat dan dokumen secara
          mandiri.
        </p>
      </header>

      <RegistrasiWargaForm />

      <p className="mt-6 text-sm text-muted-foreground">
        Sudah memiliki akun?{" "}
        <Link href="/masuk" className="text-primary underline-offset-4 hover:underline">
          Masuk di sini
        </Link>
        .
      </p>
    </div>
  );
}
