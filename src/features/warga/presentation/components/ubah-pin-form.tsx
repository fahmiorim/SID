"use client";

import { AlertCircle, CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ubahPinWargaAction } from "@/features/warga/presentation/actions";
import { idleActionState } from "@/lib/action-state";

function pesanField(fieldErrors: Record<string, string[]> | undefined, key: string): string | null {
  return fieldErrors?.[key]?.[0] ?? null;
}

/** Form ubah PIN warga; dipakai untuk PIN sementara maupun perubahan biasa. */
export function UbahPinForm({ wajibGanti }: { wajibGanti: boolean }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(ubahPinWargaAction, idleActionState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state.status !== "success") return;

    const timer = window.setTimeout(() => {
      router.push("/layanan-mandiri/beranda");
      router.refresh();
    }, 900);

    return () => window.clearTimeout(timer);
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-5">
      {state.status === "error" ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>PIN belum diperbarui</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      {state.status === "success" ? (
        <Alert>
          <CheckCircle2 />
          <AlertTitle>PIN berhasil diperbarui</AlertTitle>
          <AlertDescription>Anda akan diarahkan ke beranda layanan mandiri.</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="pinLama">{wajibGanti ? "PIN sementara" : "PIN lama"}</Label>
        <Input
          id="pinLama"
          name="pinLama"
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          pattern="\d{6}"
          maxLength={6}
          required
          autoFocus
          aria-invalid={Boolean(pesanField(fieldErrors, "pinLama"))}
        />
        {pesanField(fieldErrors, "pinLama") ? (
          <p className="text-xs text-destructive">{pesanField(fieldErrors, "pinLama")}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="pinBaru">PIN baru</Label>
        <Input
          id="pinBaru"
          name="pinBaru"
          type="password"
          inputMode="numeric"
          autoComplete="new-password"
          pattern="\d{6}"
          maxLength={6}
          required
          aria-invalid={Boolean(pesanField(fieldErrors, "pinBaru"))}
        />
        <p className="text-xs text-muted-foreground">
          Tepat 6 digit angka dan berbeda dari PIN lama.
        </p>
        {pesanField(fieldErrors, "pinBaru") ? (
          <p className="text-xs text-destructive">{pesanField(fieldErrors, "pinBaru")}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="konfirmasiPin">Ulangi PIN baru</Label>
        <Input
          id="konfirmasiPin"
          name="konfirmasiPin"
          type="password"
          inputMode="numeric"
          autoComplete="new-password"
          pattern="\d{6}"
          maxLength={6}
          required
          aria-invalid={Boolean(pesanField(fieldErrors, "konfirmasiPin"))}
        />
        {pesanField(fieldErrors, "konfirmasiPin") ? (
          <p className="text-xs text-destructive">{pesanField(fieldErrors, "konfirmasiPin")}</p>
        ) : null}
      </div>

      <Button type="submit" disabled={isPending || state.status === "success"}>
        {isPending ? <Loader2 className="animate-spin" /> : <KeyRound />}
        {isPending ? "Menyimpan…" : "Simpan PIN baru"}
      </Button>
    </form>
  );
}
