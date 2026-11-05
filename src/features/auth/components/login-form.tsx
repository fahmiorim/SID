"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useActionState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { idleActionState } from "@/lib/action-state";

import { signInAction } from "../actions";

/**
 * Formulir masuk.
 *
 * Memakai `useActionState` + Server Action sehingga: validasi otoritatif ada di
 * server (Zod), pesan galat per-field tersedia, dan formulir tetap berfungsi
 * tanpa JavaScript.
 */
export function LoginForm({
  next,
  captchaPertanyaan,
  captchaToken,
}: {
  next: string;
  captchaPertanyaan: string;
  captchaToken: string;
}) {
  const [state, formAction, isPending] = useActionState(signInAction, idleActionState);

  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <input type="hidden" name="captchaToken" value={captchaToken} />
      {/* Honeypot: pengisi otomatis biasanya mengisi kolom tersembunyi ini. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {state.status === "error" ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="username">Username atau NIK</Label>
        <Input
          id="username"
          name="username"
          autoComplete="username"
          autoFocus
          required
          aria-invalid={Boolean(fieldErrors?.username)}
        />
        <p className="text-xs text-muted-foreground">
          Staf memakai username; warga memakai NIK yang terdaftar.
        </p>
        {fieldErrors?.username?.map((message) => (
          <p key={message} className="text-xs text-destructive">
            {message}
          </p>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Kata sandi / PIN</Label>
          <a className="text-xs text-primary underline-offset-4 hover:underline" href="/lupa-sandi">
            Lupa sandi?
          </a>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(fieldErrors?.password)}
        />
        {fieldErrors?.password?.map((message) => (
          <p key={message} className="text-xs text-destructive">
            {message}
          </p>
        ))}
      </div>
      <div className="space-y-2">
        <Label htmlFor="jawaban">Verifikasi: {captchaPertanyaan}</Label>
        <Input
          id="jawaban"
          name="jawaban"
          inputMode="numeric"
          autoComplete="off"
          required
          aria-invalid={Boolean(fieldErrors?.jawaban)}
        />
        {fieldErrors?.jawaban?.map((message) => (
          <p key={message} className="text-xs text-destructive">
            {message}
          </p>
        ))}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" /> : null}
        {isPending ? "Memproses…" : "Masuk"}
      </Button>
    </form>
  );
}
