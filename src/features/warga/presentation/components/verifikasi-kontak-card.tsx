"use client";

import { BadgeCheck, Loader2, ShieldQuestion } from "lucide-react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createIdleActionState } from "@/lib/action-state";

import { mintaVerifikasiKontakAction, verifikasiKontakAction } from "../verifikasi-kontak-actions";

export function VerifikasiKontakCard({
  target,
  terverifikasi,
  teleponAwal,
}: {
  target: string | null;
  terverifikasi: boolean;
  teleponAwal: string | null;
}) {
  const [mintaState, mintaAction, mintaPending] = useActionState(
    mintaVerifikasiKontakAction,
    createIdleActionState<{ terkirim: boolean } | null>(),
  );
  const [verifikasiState, verifikasiAction, verifikasiPending] = useActionState(
    verifikasiKontakAction,
    createIdleActionState<null>(),
  );

  useEffect(() => {
    if (mintaState.status === "success") {
      if (mintaState.tone === "warning") toast.warning(mintaState.message);
      else toast.success(mintaState.message);
    } else if (mintaState.status === "error") {
      toast.error(mintaState.message);
    }
  }, [mintaState]);

  useEffect(() => {
    if (verifikasiState.status === "success") toast.success(verifikasiState.message);
    else if (verifikasiState.status === "error") toast.error(verifikasiState.message);
  }, [verifikasiState]);

  const fieldErrors = mintaState.status === "error" ? mintaState.fieldErrors : undefined;
  const kodeErrors = verifikasiState.status === "error" ? verifikasiState.fieldErrors : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {terverifikasi ? (
            <BadgeCheck className="size-4 text-primary" />
          ) : (
            <ShieldQuestion className="size-4" />
          )}
          Verifikasi Kontak
        </CardTitle>
        <CardDescription>
          {terverifikasi
            ? `Kontak ${target} sudah terverifikasi dan dipakai untuk notifikasi.`
            : "Verifikasi nomor HP (WhatsApp) atau email agar notifikasi status permohonan dan izin dapat dikirim."}
        </CardDescription>
      </CardHeader>

      {terverifikasi ? null : (
        <CardContent className="space-y-4">
          <form action={mintaAction} className="flex flex-wrap items-end gap-2">
            <div className="min-w-52 flex-1 space-y-2">
              <Label htmlFor="target">Nomor HP (WhatsApp) atau Email</Label>
              <Input
                id="target"
                name="target"
                inputMode="email"
                placeholder="08xxxxxxxxxx atau nama@email.com"
                defaultValue={target ?? teleponAwal ?? ""}
                required
              />
              {fieldErrors?.target?.map((message) => (
                <p key={message} className="text-xs text-destructive">
                  {message}
                </p>
              ))}
            </div>
            <Button type="submit" variant="outline" disabled={mintaPending}>
              {mintaPending ? <Loader2 className="size-4 animate-spin" /> : "Kirim kode"}
            </Button>
          </form>

          <form action={verifikasiAction} className="flex flex-wrap items-end gap-2">
            <div className="min-w-40 flex-1 space-y-2">
              <Label htmlFor="kode">Kode 6 digit</Label>
              <Input
                id="kode"
                name="kode"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                required
              />
              {kodeErrors?.kode?.map((message) => (
                <p key={message} className="text-xs text-destructive">
                  {message}
                </p>
              ))}
            </div>
            <Button type="submit" disabled={verifikasiPending}>
              {verifikasiPending ? <Loader2 className="size-4 animate-spin" /> : "Verifikasi"}
            </Button>
          </form>
        </CardContent>
      )}
    </Card>
  );
}
