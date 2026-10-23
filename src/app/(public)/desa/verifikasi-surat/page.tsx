import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Verifikasi Surat",
  description: "Verifikasi keaslian surat desa menggunakan token atau kode QR.",
};

export default async function VerifikasiSuratIndexPage({
  searchParams,
}: PageProps<"/desa/verifikasi-surat">) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token.trim() : "";

  if (token) {
    redirect(`/desa/verifikasi-surat/${encodeURIComponent(token)}`);
  }

  return (
    <div className="mx-auto max-w-2xl py-12">
      <h1 className="mb-6 text-2xl font-bold">Verifikasi Surat</h1>

      <div className="rounded-lg bg-white p-6 shadow">
        <p className="mb-4 text-sm text-muted-foreground">
          Masukkan token verifikasi yang tercantum pada surat atau pindai kode QR yang menyertainya.
        </p>

        <form method="get" className="flex flex-col gap-2 sm:flex-row">
          <Input
            name="token"
            required
            autoComplete="off"
            placeholder="Token verifikasi (64 karakter)"
            aria-label="Token verifikasi"
          />
          <Button type="submit">Verifikasi</Button>
        </form>
      </div>
    </div>
  );
}
