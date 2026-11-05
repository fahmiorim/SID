"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Pengaturan } from "@/features/pengaturan/domain/pengaturan";
import { createIdleActionState } from "@/lib/action-state";

import { simpanPengaturanAplikasiAction } from "../pengaturan-actions";

export function PengaturanAplikasiForm({ pengaturan }: { pengaturan: Pengaturan }) {
  const [state, formAction, isPending] = useActionState(
    simpanPengaturanAplikasiAction,
    createIdleActionState<null>(),
  );
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state.status === "success") toast.success(state.message);
    if (state.status === "error") toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      {state.status === "error" ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Web Publik</CardTitle>
          <CardDescription>Perilaku situs publik desa.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="komentarAktif"
              name="komentarAktif"
              defaultChecked={pengaturan.komentarAktif}
            />
            <div className="space-y-1">
              <Label htmlFor="komentarAktif">Aktifkan komentar publik</Label>
              <p className="text-sm text-muted-foreground">
                Bila dimatikan, form komentar disembunyikan dan API komentar menolak kiriman baru.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="beritaBeranda">Jumlah berita di beranda</Label>
            <Input
              id="beritaBeranda"
              name="beritaBeranda"
              type="number"
              min={1}
              max={12}
              defaultValue={pengaturan.beritaBeranda}
              className="max-w-32"
            />
            <p className="text-sm text-muted-foreground">Antara 1 dan 12 berita terbaru.</p>
            {fieldErrors?.beritaBeranda ? (
              <p className="text-sm text-destructive">{fieldErrors.beritaBeranda[0]}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Layanan Mandiri</CardTitle>
          <CardDescription>Pendaftaran dan batas layanan akun warga.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="pendaftaranWargaAktif"
              name="pendaftaranWargaAktif"
              defaultChecked={pengaturan.pendaftaranWargaAktif}
            />
            <div className="space-y-1">
              <Label htmlFor="pendaftaranWargaAktif">Izinkan pendaftaran akun warga</Label>
              <p className="text-sm text-muted-foreground">
                Bila dimatikan, pengajuan akun baru dari halaman publik ditutup.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Surat</CardTitle>
          <CardDescription>Konfigurasi penomoran surat.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="penomoranSurat">Mode Penomoran Surat</Label>
            <Select name="penomoranSurat" defaultValue={String(pengaturan.penomoranSurat)}>
              <SelectTrigger id="penomoranSurat" className="w-full max-w-xs">
                <SelectValue placeholder="Pilih mode penomoran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Manual</SelectItem>
                <SelectItem value="2">Otomatis per tahun</SelectItem>
                <SelectItem value="3">Otomatis per bulan</SelectItem>
                <SelectItem value="4">Otomatis per jenis</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              1=manual, 2=otomatis per tahun, 3=otomatis per bulan, 4=otomatis per jenis.
            </p>
            {fieldErrors?.penomoranSurat ? (
              <p className="text-sm text-destructive">{fieldErrors.penomoranSurat[0]}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lampiran & Tema</CardTitle>
          <CardDescription>
            Pengaturan lanjutan untuk lampiran berkas dan tema tampilan memiliki halaman tersendiri.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">Pengaturan Lampiran</p>
              <p className="text-sm text-muted-foreground">
                Atur batasan MIME, jumlah, dan ukuran file per kategori (surat, umum, dokumen).
              </p>
            </div>
            <a
              href="/pengaturan/lampiran"
              className="btn btn-sm btn-outline"
              style={{ textDecoration: "none" }}
            >
              Kelola
            </a>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">Pengaturan Tema</p>
              <p className="text-sm text-muted-foreground">
                Warna, font, hero, header, susunan beranda, dan pilihan tema.
              </p>
            </div>
            <a
              href="/pengaturan/tema"
              className="btn btn-sm btn-outline"
              style={{ textDecoration: "none" }}
            >
              Kelola
            </a>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Simpan pengaturan
        </Button>
      </div>
    </form>
  );
}
