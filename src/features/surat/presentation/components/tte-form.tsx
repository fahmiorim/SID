"use client";

import { AlertCircle, Loader2, Save } from "lucide-react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { KonfigTteTersimpan } from "@/features/surat/domain/tte";
import { createIdleActionState } from "@/lib/action-state";

import { saveTteConfigAction } from "../tte-actions";

interface TteFormProps {
  tersimpan: KonfigTteTersimpan;
  passwordTersedia: boolean;
  masalah: string[];
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null;

  return (
    <>
      {messages.map((message) => (
        <p key={message} className="text-xs text-destructive">
          {message}
        </p>
      ))}
    </>
  );
}

export function TteForm({ tersimpan, passwordTersedia, masalah }: TteFormProps) {
  const [state, formAction, isPending] = useActionState(
    saveTteConfigAction,
    createIdleActionState(),
  );
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state.status === "success") toast.success(state.message);
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Konfigurasi Provider</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!passwordTersedia ? (
          <Alert>
            <AlertCircle />
            <AlertDescription>
              Passphrase belum diatur di server. Isi <code>TTE_PASSWORD</code> pada environment
              deployment sebelum mengaktifkan mode BSrE.
            </AlertDescription>
          </Alert>
        ) : null}

        {tersimpan.mode === "bsre" && masalah.length > 0 ? (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>
              <p className="font-medium">Konfigurasi BSrE belum lengkap:</p>
              <ul className="mt-1 list-disc pl-5">
                {masalah.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        ) : null}

        {state.status === "error" && !fieldErrors ? (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        ) : null}

        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="mode">Mode</Label>
              <select
                id="mode"
                name="mode"
                defaultValue={tersimpan.mode}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="nonaktif">Nonaktif</option>
                <option value="manual">Manual (tanda tangan basah)</option>
                <option value="bsre">BSrE (API)</option>
              </select>
              <FieldError messages={fieldErrors?.mode} />
            </div>

            <div className="flex items-end gap-2 pb-2">
              <input
                id="aktif"
                name="aktif"
                type="checkbox"
                defaultChecked={tersimpan.aktif}
                className="size-4 rounded border-input"
              />
              <Label htmlFor="aktif">Aktifkan konfigurasi ini</Label>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="api">URL API BSrE</Label>
              <Input
                id="api"
                name="api"
                defaultValue={tersimpan.api}
                placeholder="https://tte.example.go.id"
                maxLength={300}
                aria-invalid={Boolean(fieldErrors?.api)}
              />
              <FieldError messages={fieldErrors?.api} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username BSrE</Label>
              <Input
                id="username"
                name="username"
                defaultValue={tersimpan.username}
                maxLength={150}
                aria-invalid={Boolean(fieldErrors?.username)}
              />
              <FieldError messages={fieldErrors?.username} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nik">NIK Penanda Tangan</Label>
              <Input
                id="nik"
                name="nik"
                defaultValue={tersimpan.nik}
                inputMode="numeric"
                maxLength={16}
                placeholder="16 digit"
                aria-invalid={Boolean(fieldErrors?.nik)}
              />
              <FieldError messages={fieldErrors?.nik} />
            </div>

            <div className="flex items-end gap-2 pb-2">
              <input
                id="ssl"
                name="ssl"
                type="checkbox"
                defaultChecked={tersimpan.ssl}
                className="size-4 rounded border-input"
              />
              <Label htmlFor="ssl">Verifikasi sertifikat TLS</Label>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Passphrase dan kredensial rahasia tidak disimpan di basis data. Atur{" "}
            <code>TTE_PASSWORD</code> (dan opsional <code>TTE_*</code>) pada environment server.
            Konfigurasi desa menimpa pilihan mode, URL, username, NIK, dan SSL.
          </p>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : <Save className="size-4" />}
              Simpan Konfigurasi
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
