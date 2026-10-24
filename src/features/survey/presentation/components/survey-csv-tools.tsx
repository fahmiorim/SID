"use client";

import { AlertCircle, BadgeCheck, Download, Loader2, Upload } from "lucide-react";
import { useActionState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { HasilImporSurvei } from "@/features/survey/application/use-cases";
import { idleActionState, type ActionState } from "@/lib/action-state";

import { imporRespondenAction } from "../actions";

const initialState: ActionState<HasilImporSurvei | null> = idleActionState;

/**
 * Alat ekspor/impor respons survei.
 *
 * Ekspor berupa tautan unduhan biasa (route memeriksa izin `read`). Impor
 * memakai Server Action agar berkas tidak perlu diunggah lewat API terpisah;
 * tombolnya hanya tampil bila pengguna punya izin `update`.
 */
export function SurveyCsvTools({
  surveyId,
  canImport,
  jumlahResponden,
}: {
  surveyId: number;
  canImport: boolean;
  jumlahResponden: number;
}) {
  const [state, formAction, isPending] = useActionState(imporRespondenAction, initialState);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-2">
        <Button variant="outline" size="sm" asChild>
          <a href={`/analisis-survei/${surveyId}/ekspor`} download>
            <Download className="size-4" />
            Ekspor CSV
          </a>
        </Button>
        <p className="text-xs text-muted-foreground">
          {jumlahResponden === 0
            ? "Belum ada responden; berkas hanya berisi header pertanyaan."
            : `${jumlahResponden} responden diekspor dengan kolom Nama, NIK, Tanggal, lalu satu kolom per pertanyaan sesuai urutan.`}{" "}
          Bisa dibuka di Excel/LibreOffice/Google Sheets.
        </p>
      </div>

      {canImport ? (
        <form action={formAction} className="space-y-2">
          <input type="hidden" name="surveyId" value={surveyId} />
          <Label htmlFor="berkas-survei">Impor CSV (kolom mengikuti urutan pertanyaan)</Label>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              id="berkas-survei"
              name="berkas"
              type="file"
              accept=".csv,text/csv,text/plain"
              required
              className="max-w-xs"
            />
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : <Upload />}
              Impor
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Format: <code>Nama;NIK;Tanggal;Jawaban 1;Jawaban 2;...</code> — NIK boleh kosong,
            tanggal diabaikan. Baris yang tidak valid dilaporkan tanpa membatalkan baris lain.
          </p>

          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          {state.status === "success" && state.data ? (
            <div className="space-y-2 rounded-lg border p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <BadgeCheck className="size-4 text-primary" />
                <span className="font-medium">{state.message}</span>
                <Badge variant="secondary">{state.data.diimpor} diimpor</Badge>
                {state.data.ditolak > 0 ? (
                  <Badge variant="destructive">{state.data.ditolak} ditolak</Badge>
                ) : null}
              </div>
              {state.data.kesalahan.length > 0 ? (
                <ul className="list-inside list-disc space-y-1 text-xs text-destructive">
                  {state.data.kesalahan.slice(0, 20).map((item) => (
                    <li key={`${item.baris}-${item.pesan}`}>
                      {item.baris > 0 ? `Baris ${item.baris}: ` : ""}
                      {item.pesan}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}
