import { ArrowLeft, FileDown } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { toString as qrToString } from "qrcode";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { urlMedia } from "@/features/publik/domain/format";
import { getSuratPrintData } from "@/features/surat/application/surat-use-cases";
import { formatTanggalIndonesia, LETTER_STATUS_LABELS } from "@/features/surat/domain/surat";
import { buildVerificationUrl } from "@/features/surat/domain/verifikasi";
import { PrintButton } from "@/features/surat/presentation/components/print-button";
import { isAppError } from "@/lib/errors";
import { getRequestOrigin } from "@/lib/request-origin";

export default async function CetakSuratPage({
  params,
}: PageProps<"/persuratan/surat/[id]/cetak">) {
  const { id } = await params;
  const suratId = Number(id);
  if (!Number.isInteger(suratId) || suratId <= 0) {
    return <p className="text-sm text-destructive">Surat tidak valid.</p>;
  }

  const { surat, jenis, desa, content } = await getSuratPrintData(suratId).catch((error) => {
    if (isAppError(error) && error.code === "NOT_FOUND") notFound();
    throw error;
  });

  const origin = await getRequestOrigin();
  const verificationUrl = surat.verificationToken
    ? buildVerificationUrl(origin, surat.verificationToken)
    : null;
  // SVG lokal (tanpa layanan pihak ketiga) agar QR tajam saat dicetak.
  const qrSvg = verificationUrl
    ? await qrToString(verificationUrl, {
        type: "svg",
        margin: 1,
        width: 96,
        errorCorrectionLevel: "M",
      })
    : null;

  const headerLines = [
    desa.namaPropinsi ? `PEMERINTAH ${desa.namaPropinsi.toUpperCase()}` : null,
    desa.namaKabupaten ? `KABUPATEN ${desa.namaKabupaten.toUpperCase()}` : null,
    desa.namaKecamatan ? `KECAMATAN ${desa.namaKecamatan.toUpperCase()}` : null,
    desa.namaDesa ? `DESA ${desa.namaDesa.toUpperCase()}` : "PEMERINTAH DESA",
  ].filter((line): line is string => line !== null);

  const logoUrl = urlMedia(desa.logo);
  const ttdUrl = urlMedia(desa.tandaTangan);
  const stempelUrl = urlMedia(desa.stempel);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/persuratan/surat">
              <ArrowLeft className="size-4" />
              Kembali
            </Link>
          </Button>
          <Badge variant={surat.status === "issued" ? "secondary" : "outline"}>
            {LETTER_STATUS_LABELS[surat.status]}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {surat.status === "issued" ? (
            <Button variant="outline" size="sm" asChild>
              <a href={`/persuratan/surat/${surat.id}/pdf`} target="_blank" rel="noreferrer">
                <FileDown className="size-4" />
                PDF
              </a>
            </Button>
          ) : null}
          <PrintButton />
        </div>
      </div>

      <article className="mx-auto max-w-[210mm] rounded-lg border bg-white p-10 text-black shadow-sm print:max-w-none print:rounded-none print:border-0 print:p-0 print:text-black print:shadow-none">
        <header className="relative border-b-4 border-double border-black pb-3 text-center">
          {logoUrl ? (
            // Logo desa di kiri kop surat (jika sudah diunggah).
            <img
              src={logoUrl}
              alt={`Logo ${desa.namaDesa ?? "desa"}`}
              className="absolute top-0 left-0 h-16 w-16 object-contain"
            />
          ) : null}
          {headerLines.map((line, index) => (
            <p
              key={line}
              className={
                index === headerLines.length - 1
                  ? "text-lg font-bold tracking-wide uppercase"
                  : "text-sm font-semibold uppercase"
              }
            >
              {line}
            </p>
          ))}
          <p className="mt-1 text-xs">
            {[desa.alamatKantor, desa.telepon ? `Telp. ${desa.telepon}` : null, desa.emailDesa]
              .filter(Boolean)
              .join(" | ")}
          </p>
        </header>

        <div className="mt-6 text-center">
          <h1 className="text-base font-bold uppercase underline">{jenis.name}</h1>
          {surat.number ? <p className="mt-1 text-sm">Nomor: {surat.number}</p> : null}
        </div>

        <div className="mt-6 text-justify text-sm leading-7 whitespace-pre-wrap">{content}</div>

        <div className="mt-10 ml-auto w-64 text-sm">
          <p>
            Desa {desa.namaDesa ?? "..."}, {formatTanggalIndonesia(surat.letterDate)}
          </p>
          <p className="mt-1">Kepala Desa</p>
          <div className="relative h-24">
            {/* Tanda tangan terupload menimpa ruang kosong; stempel menimpa
                di sisi kirinya (kosmetik: opacity agar tulisan terbaca). */}
            {stempelUrl ? (
              <img
                src={stempelUrl}
                alt="Stempel desa"
                className="absolute bottom-0 -left-16 h-20 opacity-80"
              />
            ) : null}
            {ttdUrl ? (
              <img
                src={ttdUrl}
                alt={`Tanda tangan ${desa.namaKepalaDesa ?? "Kepala Desa"}`}
                className="absolute bottom-2 left-1/2 h-14 -translate-x-1/2 object-contain"
              />
            ) : null}
          </div>
          <p className="border-b border-black font-semibold">
            {desa.namaKepalaDesa ?? ".............................."}
          </p>
          {desa.nipKepalaDesa ? <p className="mt-1 text-xs">NIP. {desa.nipKepalaDesa}</p> : null}
        </div>

        {verificationUrl ? (
          <div className="mt-8 flex items-center justify-center gap-3 border-t border-black/40 pt-2 text-[10px] leading-4">
            {qrSvg ? (
              <div
                role="img"
                aria-label="Kode QR verifikasi keaslian surat"
                className="size-24 shrink-0 [&>svg]:size-full"
                // SVG dihasilkan pustaka `qrcode` dari URL internal (bukan input pengguna).
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            ) : null}
            <div className="text-left">
              <p>Pindai kode QR atau buka tautan berikut untuk verifikasi:</p>
              <p className="font-medium break-all">{verificationUrl}</p>
              <p className="mt-1 break-all">Token: {surat.verificationToken}</p>
            </div>
          </div>
        ) : null}
      </article>
    </div>
  );
}
