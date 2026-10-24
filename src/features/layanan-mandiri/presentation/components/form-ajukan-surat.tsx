"use client";

import { AlertCircle, CheckCircle2, Loader2, Upload } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { JenisSuratWarga } from "@/features/layanan-mandiri/domain/layanan-mandiri";
import { ajukanSuratWargaAction } from "@/features/layanan-mandiri/presentation/warga-actions";
import { parseIsianFields } from "@/features/surat/domain/isian";
import { idleActionState } from "@/lib/action-state";

const TERIMA_BERKAS = "image/jpeg,image/png,image/webp,application/pdf";

function pesanField(fieldErrors: Record<string, string[]> | undefined, key: string): string | null {
  return fieldErrors?.[key]?.[0] ?? null;
}

/** Form ajukan surat dengan isian dinamis + unggah syarat. */
export function FormAjukanSurat({ jenis }: { jenis: JenisSuratWarga }) {
  const [state, formAction, isPending] = useActionState(ajukanSuratWargaAction, idleActionState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;
  const fields = parseIsianFields(jenis.formIsian);
  const sukses = state.status === "success" ? state.data : null;

  if (sukses) {
    return (
      <Alert>
        <CheckCircle2 />
        <AlertTitle>Permohonan berhasil dikirim</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>
            Nomor antrian Anda: <strong className="font-mono">{sukses.noAntrian}</strong>. Pantau
            status di halaman ini atau menu Pesan.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href="#riwayat">Lihat riwayat</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/layanan-mandiri/surat">Ajukan surat lain</Link>
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form action={formAction} className="space-y-6" encType="multipart/form-data">
      <input type="hidden" name="letterTypeId" value={jenis.id} />

      {state.status === "error" ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Permohonan belum terkirim</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      {fields.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-base font-semibold">Isian surat</h2>

          {fields.map((field) => {
            const key = `isian.${field.kode}`;
            const error = pesanField(fieldErrors, key);

            return (
              <div key={field.kode} className="space-y-2">
                <Label htmlFor={key}>
                  {field.label}
                  {field.required ? <span className="text-destructive"> *</span> : null}
                </Label>

                {field.tipe === "textarea" ? (
                  <Textarea
                    id={key}
                    name={key}
                    required={field.required}
                    placeholder={field.placeholder}
                    aria-invalid={Boolean(error)}
                  />
                ) : field.tipe === "select" ? (
                  <select
                    id={key}
                    name={key}
                    required={field.required}
                    aria-invalid={Boolean(error)}
                    className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
                  >
                    <option value="">Pilih…</option>
                    {field.opsi.map((opsi) => (
                      <option key={opsi} value={opsi}>
                        {opsi}
                      </option>
                    ))}
                  </select>
                ) : field.tipe === "checkbox" ? (
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name={key} value="true" className="size-4" />
                    {field.placeholder || "Centang bila sesuai"}
                  </label>
                ) : (
                  <Input
                    id={key}
                    name={key}
                    type={
                      field.tipe === "number" ? "number" : field.tipe === "date" ? "date" : "text"
                    }
                    required={field.required}
                    placeholder={field.placeholder}
                    aria-invalid={Boolean(error)}
                  />
                )}

                {error ? <p className="text-xs text-destructive">{error}</p> : null}
              </div>
            );
          })}
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Kontak & keterangan</h2>

        <div className="space-y-2">
          <Label htmlFor="noHpAktif">Nomor HP aktif</Label>
          <Input id="noHpAktif" name="noHpAktif" inputMode="tel" maxLength={30} />
          <p className="text-xs text-muted-foreground">
            Dipakai operator untuk menghubungi Anda bila berkas perlu dilengkapi.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="keterangan">Keterangan</Label>
          <Textarea id="keterangan" name="keterangan" maxLength={500} />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold">Syarat yang harus diunggah</h2>
          <p className="text-sm text-muted-foreground">
            Format yang diterima: JPG, PNG, WEBP, atau PDF. Maksimal 5 MB untuk gambar dan 20 MB
            untuk PDF.
          </p>
        </div>

        {jenis.syarat.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Jenis surat ini tidak memerlukan berkas syarat.
          </p>
        ) : (
          jenis.syarat.map((syarat) => {
            const key = `syarat.${syarat.id}`;
            const error = pesanField(fieldErrors, key);

            return (
              <div key={syarat.id} className="space-y-2">
                <Label htmlFor={key}>
                  {syarat.nama}
                  <span className="text-destructive"> *</span>
                </Label>
                {syarat.keterangan ? (
                  <p className="text-xs text-muted-foreground">{syarat.keterangan}</p>
                ) : null}
                <Input
                  id={key}
                  name={key}
                  type="file"
                  accept={TERIMA_BERKAS}
                  required
                  aria-invalid={Boolean(error)}
                />
                {error ? <p className="text-xs text-destructive">{error}</p> : null}
              </div>
            );
          })
        )}
      </section>

      <Button type="submit" disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" /> : <Upload />}
        {isPending ? "Mengirim…" : "Kirim permohonan"}
      </Button>
    </form>
  );
}
