import { verifikasiSuratPublik } from "@/features/surat/application/verifikasi-publik";
import { VERIFICATION_STEP_LABELS } from "@/features/surat/domain/surat";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/desa/verifikasi-surat/[token]">) {
  const { token } = await params;
  const { surat } = await verifikasiSuratPublik(token);

  let title = "Verifikasi Surat";
  let description = "";

  if (surat) {
    title = `Verifikasi Surat · ${surat.status}`;
    description = `Halaman verifikasi surat ${surat.status.toLowerCase()} di desa`;
  } else {
    title = "Verifikasi Surat · Tidak Ditemukan";
    description = "Surat dengan token yang Anda cari tidak ditemukan";
  }

  return { title, description };
}

export default async function VerifikasiSuratPage({
  params,
}: PageProps<"/desa/verifikasi-surat/[token]">) {
  const { token } = await params;
  const { surat } = await verifikasiSuratPublik(token);

  if (!surat) {
    return <VerifikasiTidakDitemukan />;
  }

  // Determine verification state
  const isVerified = surat.verifikasiOperator && surat.verifikasiSekdes && surat.verifikasiKades;

  const statusLabel =
    surat.status === "issued"
      ? "Siap Diambil"
      : surat.status === "verifikasi"
        ? isVerified
          ? "Sudah Diverifikasi"
          : "Menunggu Verifikasi"
        : surat.status;

  const verificationStep =
    surat.status === "verifikasi"
      ? surat.verifikasiOperator && !surat.verifikasiSekdes
        ? "operator"
        : surat.verifikasiOperator && surat.verifikasiSekdes && !surat.verifikasiKades
          ? "sekdes"
          : "kades"
      : null;

  const stepLabel = verificationStep
    ? VERIFICATION_STEP_LABELS[verificationStep as keyof typeof VERIFICATION_STEP_LABELS]
    : "-";

  return (
    <div className="mx-auto max-w-2xl py-12">
      <h1 className="mb-6 text-2xl font-bold">Verifikasi Surat</h1>

      <div className="mb-8 rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">
          {surat.typeName ?? "Surat"} {surat.year}
        </h2>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Nomor Surat</p>
            <p className="font-medium">{surat.number ?? "—"}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <span
              className={`rounded px-2 py-1 text-sm font-medium ${isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
            >
              {statusLabel}
            </span>
          </div>

          {surat.status === "verifikasi" && (
            <div>
              <p className="text-sm text-muted-foreground">Tahap Verifikasi</p>
              <p className="font-medium">{stepLabel}</p>
            </div>
          )}

          {surat.logVerifikasi && (
            <div>
              <p className="text-sm text-muted-foreground">Catatan Verifikasi</p>
              <p>{surat.logVerifikasi}</p>
            </div>
          )}

          {surat.catatanVerifikasi && (
            <div>
              <p className="text-sm text-muted-foreground">Alasan Penolakan</p>
              <p>{surat.catatanVerifikasi}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-muted-foreground">Dibuat Pada</p>
            <p>{surat.createdAt.toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {surat.status === "issued" && (
        <div className="mt-8 rounded-lg bg-green-50 p-6">
          <h2 className="mb-4 text-xl font-semibold">Surat Sudah Terbit</h2>
          <p className="text-base">
            Surat ini sudah selesai diverifikasi dan siap diambil. <br />
            Anda dapat mengunduh atau mencetak surat melalui sistem desa.
          </p>
        </div>
      )}
    </div>
  );
}

function VerifikasiTidakDitemukan() {
  return (
    <div className="mx-auto max-w-2xl py-12 text-center">
      <h1 className="mb-4 text-3xl font-bold">Surat Tidak Ditemukan</h1>
      <p className="mb-6 text-lg text-muted-foreground">
        Surat dengan token yang Anda cari tidak ditemukan dalam sistem.
      </p>
      <a
        href="/desa"
        className="hover:bg-primary-dark inline-block rounded bg-primary px-4 py-2 text-white transition-colors"
      >
        Kembali ke Beranda Desa
      </a>
    </div>
  );
}
