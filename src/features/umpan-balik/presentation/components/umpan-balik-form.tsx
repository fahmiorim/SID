"use client";

import { Loader2, Send } from "lucide-react";
import { useActionState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { idleActionState } from "@/lib/action-state";

import { kirimUmpanBalikAction } from "../publik-actions";

/** Formulir umpan balik publik di halaman kontak (OS-WEB-015). */
export function UmpanBalikForm({
  captchaPertanyaan,
  captchaToken,
}: {
  captchaPertanyaan: string;
  captchaToken: string;
}) {
  const [state, formAction, pending] = useActionState(kirimUmpanBalikAction, idleActionState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-4">
      {state.status === "success" ? (
        <Alert>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      {state.status === "error" ? (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="umpan-nama">Nama (opsional)</Label>
          <Input id="umpan-nama" name="nama" maxLength={100} placeholder="Nama Anda" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="umpan-kontak">Kontak (opsional)</Label>
          <Input
            id="umpan-kontak"
            name="kontak"
            maxLength={150}
            placeholder="Email atau nomor HP"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="umpan-pesan">Pesan</Label>
        <Textarea
          id="umpan-pesan"
          name="pesan"
          rows={4}
          required
          minLength={10}
          maxLength={2000}
          placeholder="Saran, pertanyaan, atau masukan untuk desa…"
        />
        {fieldErrors?.pesan ? (
          <p className="text-sm text-destructive">{fieldErrors.pesan[0]}</p>
        ) : null}
      </div>

      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      <input type="hidden" name="captcha" value={captchaToken} />

      <div className="space-y-2">
        <Label htmlFor="umpan-jawaban">Verifikasi: {captchaPertanyaan}</Label>
        <Input
          id="umpan-jawaban"
          name="jawaban"
          inputMode="numeric"
          autoComplete="off"
          placeholder="Jawaban"
          required
        />
        {fieldErrors?.jawaban ? (
          <p className="text-sm text-destructive">{fieldErrors.jawaban[0]}</p>
        ) : null}
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Kirim umpan balik
      </Button>
    </form>
  );
}
