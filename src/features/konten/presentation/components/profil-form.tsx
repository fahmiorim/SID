"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ProfilDesaAdmin } from "@/features/konten/domain/profil";
import { idleActionState } from "@/lib/action-state";

import { simpanProfilAction } from "../profil-actions";

interface ProfilFormProps {
  profil: ProfilDesaAdmin;
  canManage: boolean;
}

/** Tampilkan pesan kesalahan milik satu field. */
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

/** Form profil desa; tampil read-only bila pengguna hanya berhak membaca. */
export function ProfilForm({ profil, canManage }: ProfilFormProps) {
  const [state, formAction, isPending] = useActionState(simpanProfilAction, idleActionState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state.status === "success") toast.success(state.message);
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      {state.status === "error" ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Visi & Misi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="visi">Visi</Label>
              <Textarea
                id="visi"
                name="visi"
                defaultValue={profil.visi}
                rows={3}
                maxLength={2000}
                disabled={!canManage}
                aria-invalid={Boolean(fieldErrors?.visi)}
              />
              <FieldError messages={fieldErrors?.visi} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="misi">Misi</Label>
              <Textarea
                id="misi"
                name="misi"
                defaultValue={profil.misi}
                rows={6}
                maxLength={5000}
                disabled={!canManage}
                aria-invalid={Boolean(fieldErrors?.misi)}
              />
              <p className="text-xs text-muted-foreground">
                Satu butir misi per baris; ditampilkan sebagai daftar bernomor.
              </p>
              <FieldError messages={fieldErrors?.misi} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sejarah & Sambutan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sejarah">Sejarah Desa</Label>
              <Textarea
                id="sejarah"
                name="sejarah"
                defaultValue={profil.sejarah}
                rows={6}
                className="font-mono text-sm"
                disabled={!canManage}
                aria-invalid={Boolean(fieldErrors?.sejarah)}
              />
              <p className="text-xs text-muted-foreground">
                Boleh HTML sederhana (paragraf, daftar, tautan); skrip dibuang saat disimpan.
              </p>
              <FieldError messages={fieldErrors?.sejarah} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sambutan">Sambutan Kepala Desa</Label>
              <Textarea
                id="sambutan"
                name="sambutan"
                defaultValue={profil.sambutan}
                rows={5}
                className="font-mono text-sm"
                disabled={!canManage}
                aria-invalid={Boolean(fieldErrors?.sambutan)}
              />
              <p className="text-xs text-muted-foreground">
                Dipakai pada hero beranda dan halaman profil. HTML ringan diizinkan.
              </p>
              <FieldError messages={fieldErrors?.sambutan} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lokasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="koordinat">Koordinat Kantor Desa</Label>
          <Input
            id="koordinat"
            name="koordinat"
            defaultValue={profil.koordinat}
            placeholder="-6.200000, 106.816666"
            maxLength={60}
            disabled={!canManage}
            aria-invalid={Boolean(fieldErrors?.koordinat)}
          />
          <p className="text-xs text-muted-foreground">
            Format lintang, bujur. Dipakai untuk tautan peta di halaman profil.
          </p>
          <FieldError messages={fieldErrors?.koordinat} />
        </CardContent>
      </Card>

      {canManage ? (
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" /> : null}
            Simpan Profil
          </Button>
        </div>
      ) : null}
    </form>
  );
}
