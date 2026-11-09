"use client";

import { AlertCircle, Delete, Loader2, LogIn } from "lucide-react";
import { useActionState, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifikasiKioskAction } from "@/features/anjungan/presentation/kiosk-actions";
import { idleActionState } from "@/lib/action-state";

const TOMBOL_ANGKA = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

/**
 * Verifikasi tanpa akun di layar kiosk: NIK + tanggal lahir.
 *
 * Bila perangkat mengaktifkan `keyboard`, NIK diisi lewat papan angka di layar
 * (implementasi orisinal, bukan pustaka keyboard OpenSID).
 */
export function KioskLoginForm({ keyboardAktif }: { keyboardAktif: boolean }) {
  const [state, formAction, isPending] = useActionState(verifikasiKioskAction, idleActionState);
  const [nik, setNik] = useState("");
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  function ketik(digit: string) {
    setNik((lama) => (lama + digit).slice(0, 16));
  }

  function hapus() {
    setNik((lama) => lama.slice(0, -1));
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.status === "error" ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Verifikasi gagal</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="nik">NIK</Label>
        <Input
          id="nik"
          name="nik"
          value={nik}
          onChange={(event) => setNik(event.target.value.replace(/\D/g, "").slice(0, 16))}
          readOnly={keyboardAktif}
          inputMode="numeric"
          autoComplete="off"
          placeholder="16 angka pada KTP"
          maxLength={16}
          aria-invalid={Boolean(fieldErrors?.nik)}
          className="h-12 text-center font-mono text-lg tracking-[0.3em]"
        />
        {fieldErrors?.nik ? <p className="text-xs text-destructive">{fieldErrors.nik[0]}</p> : null}
      </div>

      {keyboardAktif ? (
        <div className="mx-auto grid max-w-sm grid-cols-3 gap-2">
          {TOMBOL_ANGKA.map((digit) => (
            <Button
              key={digit}
              type="button"
              variant="outline"
              className="h-14 text-xl font-semibold"
              onClick={() => ketik(digit)}
            >
              {digit}
            </Button>
          ))}
          <Button type="button" variant="outline" className="h-14" onClick={hapus}>
            <Delete className="size-5" />
            <span className="sr-only">Hapus angka terakhir</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-14 text-xl font-semibold"
            onClick={() => ketik("0")}
          >
            0
          </Button>
          <Button type="button" variant="outline" className="h-14" onClick={() => setNik("")}>
            Kosongkan
          </Button>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="tanggalLahir">Tanggal lahir</Label>
        <Input
          id="tanggalLahir"
          name="tanggalLahir"
          type="date"
          required
          aria-invalid={Boolean(fieldErrors?.tanggalLahir)}
          className="h-12"
        />
        {fieldErrors?.tanggalLahir ? (
          <p className="text-xs text-destructive">{fieldErrors.tanggalLahir[0]}</p>
        ) : null}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isPending || nik.length !== 16}>
        {isPending ? <Loader2 className="animate-spin" /> : <LogIn />}
        {isPending ? "Memverifikasi…" : "Verifikasi & lanjutkan"}
      </Button>
    </form>
  );
}
