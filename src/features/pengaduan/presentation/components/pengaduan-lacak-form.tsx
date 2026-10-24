"use client";

import { AlertCircle, Loader2, Search } from "lucide-react";
import { useActionState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  labelKategori,
  labelStatus,
  type PengaduanLacak,
  type StatusPengaduan,
} from "@/features/pengaduan/domain/pengaduan";
import { idleActionState, type ActionState } from "@/lib/action-state";

import { lacakPengaduanAction } from "../publik-actions";

function badgeStatus(status: StatusPengaduan) {
  switch (status) {
    case "baru":
      return <Badge variant="outline">Baru</Badge>;
    case "diproses":
      return <Badge>Diproses</Badge>;
    case "selesai":
      return <Badge variant="secondary">Selesai</Badge>;
    default:
      return <Badge variant="destructive">Ditolak</Badge>;
  }
}

const initialState: ActionState<PengaduanLacak | null> = idleActionState;

function tanggal(value: Date | string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", { dateStyle: "medium" });
}

/**
 * Form pelacakan tiket pengaduan oleh warga.
 *
 * Nomor tiket saja tidak cukup; warga wajib menyertakan salah satu identitas
 * (NIK/telepon/email) yang diisi saat mengirim agar pengaduan orang lain tidak
 * dapat dibaca hanya dengan menebak nomor tiket.
 */
export function PengaduanLacakForm() {
  const [state, formAction, isPending] = useActionState(lacakPengaduanAction, initialState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="pt-6">
          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nomorTiket">Nomor tiket</Label>
              <Input
                id="nomorTiket"
                name="nomorTiket"
                required
                autoComplete="off"
                placeholder="PGD-20261024-0001"
                aria-invalid={Boolean(fieldErrors?.nomorTiket)}
              />
              {fieldErrors?.nomorTiket?.map((message) => (
                <p key={message} className="text-xs text-destructive">
                  {message}
                </p>
              ))}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="identitas">NIK, telepon, atau email saat mengirim</Label>
              <Input
                id="identitas"
                name="identitas"
                required
                autoComplete="off"
                placeholder="Contoh: 3201010101010001 atau 0812xxxxxxx"
                aria-invalid={Boolean(fieldErrors?.identitas)}
              />
              <p className="text-xs text-muted-foreground">
                Salah satu identitas yang Anda isi pada formulir pengaduan. Data ini tidak
                ditampilkan ke publik.
              </p>
              {fieldErrors?.identitas?.map((message) => (
                <p key={message} className="text-xs text-destructive">
                  {message}
                </p>
              ))}
            </div>

            {state.status === "error" && !state.fieldErrors ? (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            ) : null}

            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : <Search />}
              Lacak pengaduan
            </Button>
          </form>
        </CardContent>
      </Card>

      {state.status === "success" && state.data ? (
        <Card>
          <CardContent className="space-y-3 pt-6">
            <div className="flex flex-wrap items-center gap-2">
              {badgeStatus(state.data.status)}
              <Badge variant="outline">{labelKategori(state.data.kategori)}</Badge>
              <span className="font-mono text-xs text-muted-foreground">
                {state.data.nomorTiket}
              </span>
            </div>

            <div>
              <h2 className="text-lg font-semibold">{state.data.judul}</h2>
              <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                {state.data.isi}
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              Dikirim {tanggal(state.data.createdAt)}
              {state.data.ditanggapiPada
                ? ` · Ditanggapi ${tanggal(state.data.ditanggapiPada)}`
                : ""}
            </p>

            <div className="rounded-lg border border-dashed p-3">
              <p className="mb-1 text-xs text-muted-foreground">Tanggapan desa</p>
              {state.data.tanggapan ? (
                <p className="text-sm leading-relaxed whitespace-pre-line">
                  {state.data.tanggapan}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Belum ada tanggapan. Status saat ini: {labelStatus(state.data.status)}.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
