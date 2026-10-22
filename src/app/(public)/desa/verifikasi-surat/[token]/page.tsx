import { eq } from "drizzle-orm";

import { db } from "@/db";
import { letters } from "@/db/schema/letters";
import { VERIFICATION_STEP_LABELS } from "@/features/surat/domain/surat";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { token: string } }) {
  const token = params.token;
  const [letter] = await db
    .select({ status: letters.status, typeId: letters.typeId, year: letters.year })
    .from(letters)
    .where(eq(letters.id, Number(token)))
    .limit(1);

  let title = "Verifikasi Surat";
  let description = "";

  if (letter) {
    title = `Verifikasi Surat · ${letter.status}`;
    description = `Halaman verifikasi surat ${letter.status.toLowerCase()} di desa`;
  } else {
    title = "Verifikasi Surat · Tidak Ditemukan";
    description = "Surat dengan token yang Anda cari tidak ditemukan";
  }

  return { title, description };
}

export default async function VerifikasiSuratPage({ params }: { params: { token: string } }) {
  const token = params.token;

  // Cari surat berdasarkan ID token
  const [letter] = await db
    .select({
      id: letters.id,
      typeId: letters.typeId,
      year: letters.year,
      status: letters.status,
      verifikasiOperator: letters.verifikasiOperator,
      verifikasiSekdes: letters.verifikasiSekdes,
      verifikasiKades: letters.verifikasiKades,
      logVerifikasi: letters.logVerifikasi,
      catatanVerifikasi: letters.catatanVerifikasi,
      createdAt: letters.createdAt,
      tte: letters.tte,
    })
    .from(letters)
    .where(eq(letters.id, Number(token)))
    .limit(1);

  if (!letter) {
    return <VerifikasiTidakDitemukan />;
  }

  // Determine verification state
  const isVerified = letter.verifikasiOperator && letter.verifikasiSekdes && letter.verifikasiKades;

  const statusLabel =
    letter.status === "issued"
      ? "Siap Diambil"
      : letter.status === "verifikasi"
        ? isVerified
          ? "Sudah Diverifikasi"
          : "Menunggu Verifikasi"
        : letter.status;

  const verificationStep =
    letter.status === "verifikasi"
      ? letter.verifikasiOperator && !letter.verifikasiSekdes
        ? "operator"
        : letter.verifikasiOperator && letter.verifikasiSekdes && !letter.verifikasiKades
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
          {letter.typeId ?? "Surat"} {letter.year ?? ""}
        </h2>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Nomor Surat</p>
            <p className="font-medium">{letter.id}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <span
              className={`rounded px-2 py-1 text-sm font-medium ${isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
            >
              {statusLabel}
            </span>
          </div>

          {letter.status === "verifikasi" && (
            <div>
              <p className="text-sm text-muted-foreground">Tahap Verifikasi</p>
              <p className="font-medium">{stepLabel}</p>
            </div>
          )}

          {letter.logVerifikasi && (
            <div>
              <p className="text-sm text-muted-foreground">Catatan Verifikasi</p>
              <p>{letter.logVerifikasi}</p>
            </div>
          )}

          {letter.catatanVerifikasi && (
            <div>
              <p className="text-sm text-muted-foreground">Alasan Penolakan</p>
              <p>{letter.catatanVerifikasi}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-muted-foreground">Dibuat Pada</p>
            <p>{letter.createdAt.toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {letter.status === "issued" && (
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
