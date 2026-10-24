"use client";

import { AlertCircle, BadgeCheck, Loader2 } from "lucide-react";
import { useActionState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ALAMAT_MAX,
  EMAIL_MAX,
  ISI_MAX,
  JUDUL_MAX,
  KATEGORI_PENGADUAN,
  NAMA_MAX,
  TELEPON_MAX,
} from "@/features/pengaduan/domain/pengaduan";
import { idleActionState } from "@/lib/action-state";

import { kirimPengaduanAction } from "../publik-actions";

/**
 * Formulir kirim pengaduan pada web publik.
 *
 * Pelapor tidak perlu masuk; identitas hanya dibutuhkan agar petugas bisa
 * menghubungi pelapor. Setelah berhasil, nomor tiket ditampilkan besar agar
 * warga dapat melacak status lewat petugas desa.
 */
export function PengaduanFormPublik() {
  const [state, formAction, isPending] = useActionState(kirimPengaduanAction, idleActionState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="mb-1 text-lg font-semibold">Kirim Pengaduan</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Ceritakan masukan atau pengaduan Anda. Identitas hanya digunakan petugas desa untuk
          menindaklanjuti dan tidak pernah ditampilkan di situs publik.
        </p>

        {state.status === "success" ? (
          <Alert className="mb-4 border-green-600/40">
            <BadgeCheck className="text-green-600" />
            <AlertDescription>
              <strong>{state.message}</strong>
              <span className="mt-1 block text-xs text-muted-foreground">
                Anda bisa menyerahkan nomor tiket ini ke petugas desa untuk menanyakan status
                penanganannya.
              </span>
            </AlertDescription>
          </Alert>
        ) : null}

        {/* Ganti `key` saat sukses memaksa React me-remount form sehingga semua
            isian (termasuk Select & input berkas) kembali kosong — tanpa
            efek/setState tambahan. */}
        <form
          key={state.status === "success" ? "sukses" : "isian"}
          action={formAction}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="kategori">Kategori pengaduan</Label>
              <Select name="kategori" defaultValue="umum" required>
                <SelectTrigger id="kategori" className="w-full">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {KATEGORI_PENGADUAN.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors?.kategori?.map((message) => (
                <p key={message} className="text-xs text-destructive">
                  {message}
                </p>
              ))}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="judul">Judul</Label>
              <Input
                id="judul"
                name="judul"
                required
                maxLength={JUDUL_MAX}
                placeholder="Ringkasan singkat pengaduan"
                aria-invalid={Boolean(fieldErrors?.judul)}
              />
              {fieldErrors?.judul?.map((message) => (
                <p key={message} className="text-xs text-destructive">
                  {message}
                </p>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="isi">Uraian pengaduan</Label>
            <Textarea
              id="isi"
              name="isi"
              required
              rows={5}
              maxLength={ISI_MAX}
              placeholder="Jelaskan kapan, di mana, dan apa yang anda alami. Minimal 20 karakter."
              aria-invalid={Boolean(fieldErrors?.isi)}
            />
            {fieldErrors?.isi?.map((message) => (
              <p key={message} className="text-xs text-destructive">
                {message}
              </p>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="namaPelapor">Nama</Label>
              <Input
                id="namaPelapor"
                name="namaPelapor"
                required
                maxLength={NAMA_MAX}
                aria-invalid={Boolean(fieldErrors?.namaPelapor)}
              />
              {fieldErrors?.namaPelapor?.map((message) => (
                <p key={message} className="text-xs text-destructive">
                  {message}
                </p>
              ))}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nik">
                NIK <span className="font-normal text-muted-foreground">(opsional)</span>
              </Label>
              <Input
                id="nik"
                name="nik"
                inputMode="numeric"
                maxLength={16}
                aria-invalid={Boolean(fieldErrors?.nik)}
              />
              {fieldErrors?.nik?.map((message) => (
                <p key={message} className="text-xs text-destructive">
                  {message}
                </p>
              ))}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="telepon">
                Telepon <span className="font-normal text-muted-foreground">(opsional)</span>
              </Label>
              <Input
                id="telepon"
                name="telepon"
                type="tel"
                maxLength={TELEPON_MAX}
                aria-invalid={Boolean(fieldErrors?.telepon)}
              />
              {fieldErrors?.telepon?.map((message) => (
                <p key={message} className="text-xs text-destructive">
                  {message}
                </p>
              ))}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">
                Email <span className="font-normal text-muted-foreground">(opsional)</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                maxLength={EMAIL_MAX}
                aria-invalid={Boolean(fieldErrors?.email)}
              />
              {fieldErrors?.email?.map((message) => (
                <p key={message} className="text-xs text-destructive">
                  {message}
                </p>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="alamat">
              Alamat <span className="font-normal text-muted-foreground">(opsional)</span>
            </Label>
            <Input
              id="alamat"
              name="alamat"
              maxLength={ALAMAT_MAX}
              placeholder="Alamat atau lokasi kejadian"
              aria-invalid={Boolean(fieldErrors?.alamat)}
            />
            {fieldErrors?.alamat?.map((message) => (
              <p key={message} className="text-xs text-destructive">
                {message}
              </p>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lampiran">
              Lampiran <span className="font-normal text-muted-foreground">(opsional)</span>
            </Label>
            <Input
              id="lampiran"
              name="lampiran"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              aria-invalid={Boolean(fieldErrors?.lampiran)}
            />
            <p className="text-xs text-muted-foreground">
              Foto kejadian atau dokumen pendukung, JPG/PNG/WEBP/PDF maksimal 20 MB.
            </p>
            {fieldErrors?.lampiran?.map((message) => (
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
            {isPending ? <Loader2 className="animate-spin" /> : null}
            Kirim pengaduan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
