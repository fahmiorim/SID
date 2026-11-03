"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createIdleActionState } from "@/lib/action-state";

import { kirimRegistrasiWargaAction } from "../registrasi-warga-actions";

export function RegistrasiWargaForm() {
  const [state, formAction, isPending] = useActionState(
    kirimRegistrasiWargaAction,
    createIdleActionState<null>(),
  );
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <Card>
      <CardContent className="p-6">
        {state.status === "success" ? (
          <Alert className="mb-4">
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        ) : null}

        {state.status === "error" ? (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        ) : null}

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nik">NIK</Label>
            <Input
              id="nik"
              name="nik"
              inputMode="numeric"
              maxLength={16}
              placeholder="16 digit NIK sesuai KTP"
              required
            />
            {fieldErrors?.nik ? (
              <p className="text-sm text-destructive">{fieldErrors.nik[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nama">Nama lengkap</Label>
            <Input id="nama" name="nama" maxLength={100} placeholder="Nama sesuai KTP" required />
            {fieldErrors?.nama ? (
              <p className="text-sm text-destructive">{fieldErrors.nama[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="noHp">Nomor HP (opsional)</Label>
            <Input id="noHp" name="noHp" maxLength={20} placeholder="08xxxxxxxxxx" />
            {fieldErrors?.noHp ? (
              <p className="text-sm text-destructive">{fieldErrors.noHp[0]}</p>
            ) : null}
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengirim...
              </>
            ) : (
              "Kirim Permohonan"
            )}
          </Button>
        </form>

        <p className="mt-4 text-sm text-muted-foreground">
          Setelah disetujui petugas desa, Anda akan menerima PIN sementara yang wajib diganti saat
          pertama kali masuk. Login memakai NIK sebagai nama pengguna.
        </p>
      </CardContent>
    </Card>
  );
}
