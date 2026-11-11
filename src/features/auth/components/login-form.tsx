"use client";

import {
  AlertCircle,
  Eye,
  EyeOff,
  Hash,
  KeyRound,
  Loader2,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useActionState, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { idleActionState } from "@/lib/action-state";

import { signInAction } from "../actions";

const inputClass =
  "h-11 rounded-xl border-black/10 bg-white/80 px-3.5 text-sm shadow-[inset_0_1px_2px_rgb(0_0_0/0.025)] transition-[border-color,box-shadow] placeholder:text-muted-foreground/70 hover:border-black/15 focus-visible:ring-[var(--brand)]/25";

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
  const [tampilSandi, setTampilSandi] = useState(false);

  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <input type="hidden" name="captchaToken" value={captchaToken} />
      {/* Honeypot: pengisi otomatis biasanya mengisi kolom tersembunyi ini. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {state.status === "error" ? (
        <Alert variant="destructive" className="rounded-xl">
          <AlertCircle />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="username">Username atau NIK</Label>
        <div className="relative">
          <UserRound
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="username"
            name="username"
            autoComplete="username"
            autoFocus
            required
            aria-invalid={Boolean(fieldErrors?.username)}
            className={`${inputClass} pl-10`}
          />
        </div>
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
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="password">Kata sandi / PIN</Label>
          <a
            className="text-xs font-medium text-[var(--brand)] underline-offset-4 hover:underline"
            href="/lupa-sandi"
          >
            Lupa sandi?
          </a>
        </div>
        <div className="relative">
          <KeyRound
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="password"
            name="password"
            type={tampilSandi ? "text" : "password"}
            autoComplete="current-password"
            required
            aria-invalid={Boolean(fieldErrors?.password)}
            className={`${inputClass} pr-11 pl-10`}
          />
          <button
            type="button"
            onClick={() => setTampilSandi((value) => !value)}
            aria-label={tampilSandi ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none"
          >
            {tampilSandi ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>
        {fieldErrors?.password?.map((message) => (
          <p key={message} className="text-xs text-destructive">
            {message}
          </p>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="otp">Kode OTP (bila aktif)</Label>
        <div className="relative">
          <Hash
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="otp"
            name="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            aria-invalid={Boolean(fieldErrors?.otp)}
            className={`${inputClass} pl-10 tracking-[0.16em]`}
          />
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Kosongkan bila akun Anda tidak memakai OTP. Bila wajib, kode dikirim ke WhatsApp/email
          terdaftar saat Anda menekan Masuk.
        </p>
        {fieldErrors?.otp?.map((message) => (
          <p key={message} className="text-xs text-destructive">
            {message}
          </p>
        ))}
      </div>

      <div className="space-y-2 rounded-xl border border-[var(--brand)]/10 bg-[var(--brand-soft)]/70 p-3.5">
        <Label htmlFor="jawaban" className="flex items-center gap-2 text-[13px]">
          <ShieldCheck className="size-4 shrink-0 text-[var(--brand)]" aria-hidden="true" />
          <span>Verifikasi: {captchaPertanyaan}</span>
        </Label>
        <Input
          id="jawaban"
          name="jawaban"
          inputMode="numeric"
          autoComplete="off"
          required
          aria-invalid={Boolean(fieldErrors?.jawaban)}
          className={`${inputClass} bg-white`}
        />
        {fieldErrors?.jawaban?.map((message) => (
          <p key={message} className="text-xs text-destructive">
            {message}
          </p>
        ))}
      </div>

      <Button
        type="submit"
        className="h-11 w-full rounded-xl bg-[var(--brand)] text-[var(--brand-foreground)] shadow-[0_14px_28px_-16px_var(--brand)] transition-all hover:bg-[var(--brand-strong)] hover:shadow-[0_18px_34px_-16px_var(--brand)]"
        disabled={isPending}
      >
        {isPending ? <Loader2 className="animate-spin" /> : null}
        {isPending ? "Memproses…" : "Masuk"}
      </Button>
    </form>
  );
}
