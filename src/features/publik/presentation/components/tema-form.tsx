"use client";

import { Loader2, Palette } from "lucide-react";
import { useActionState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TemaFormValues } from "@/features/publik/domain/tema";
import {
  FONT_CHOICES,
  FONT_LABELS,
  HEADER_VARIANTS,
  SOSMED_LABELS,
  SOSMED_PLATFORMS,
} from "@/features/publik/domain/theme";
import { idleActionState } from "@/lib/action-state";

import { simpanTemaAction } from "../tema-actions";

const BERANDA_OPTIONS: { value: string; label: string }[] = [
  { value: "hero", label: "Sambutan / hero" },
  { value: "slider", label: "Sorotan desa" },
  { value: "statistik", label: "Data kependudukan" },
  { value: "widget", label: "Widget informasi" },
  { value: "berita", label: "Berita terbaru" },
  { value: "surat", label: "Surat layanan terbaru" },
  { value: "kontak", label: "Kontak desa" },
];

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null;
  return <p className="text-sm text-destructive">{messages.join(" ")}</p>;
}

/** Form pengaturan opsi tema publik (warna, font, hero, susunan beranda). */
export function TemaForm({
  nilai,
  canManage,
  namaTema,
}: {
  nilai: TemaFormValues;
  canManage: boolean;
  namaTema: string;
}) {
  const [state, formAction, pending] = useActionState(simpanTemaAction, idleActionState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Palette className="size-4" />
          Opsi Tema {namaTema}
        </CardTitle>
        <CardDescription>
          Warna, tipografi, dan susunan beranda diterapkan langsung ke situs publik.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="space-y-6">
          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}
          {state.status === "success" ? (
            <Alert>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="warnaPrimer">Warna primer</Label>
              <div className="flex items-center gap-3">
                <input
                  id="warnaPrimer"
                  name="warnaPrimer"
                  type="color"
                  defaultValue={nilai.warnaPrimer}
                  disabled={!canManage}
                  className="h-9 w-14 rounded border bg-background"
                />
                <Input
                  aria-label="Kode warna primer"
                  defaultValue={nilai.warnaPrimer}
                  disabled={!canManage}
                  className="font-mono"
                  readOnly
                  tabIndex={-1}
                />
              </div>
              <FieldError messages={fieldErrors?.warnaPrimer} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="warnaSekunder">Warna sekunder</Label>
              <div className="flex items-center gap-3">
                <input
                  id="warnaSekunder"
                  name="warnaSekunder"
                  type="color"
                  defaultValue={nilai.warnaSekunder}
                  disabled={!canManage}
                  className="h-9 w-14 rounded border bg-background"
                />
                <Input
                  aria-label="Kode warna sekunder"
                  defaultValue={nilai.warnaSekunder}
                  disabled={!canManage}
                  className="font-mono"
                  readOnly
                  tabIndex={-1}
                />
              </div>
              <FieldError messages={fieldErrors?.warnaSekunder} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="font">Tipografi</Label>
              <Select name="font" defaultValue={nilai.font} disabled={!canManage}>
                <SelectTrigger id="font">
                  <SelectValue placeholder="Pilih tipografi" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_CHOICES.map((choice) => (
                    <SelectItem key={choice} value={choice}>
                      {FONT_LABELS[choice]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError messages={fieldErrors?.font} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="headerVarian">Gaya header</Label>
              <Select name="headerVarian" defaultValue={nilai.headerVarian} disabled={!canManage}>
                <SelectTrigger id="headerVarian">
                  <SelectValue placeholder="Pilih gaya header" />
                </SelectTrigger>
                <SelectContent>
                  {HEADER_VARIANTS.map((varian) => (
                    <SelectItem key={varian} value={varian}>
                      {varian === "terang" ? "Terang" : "Berwarna"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError messages={fieldErrors?.headerVarian} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kelengkungan">Kelengkungan sudut (rem)</Label>
              <Input
                id="kelengkungan"
                name="kelengkungan"
                type="number"
                min={0}
                max={2}
                step={0.25}
                defaultValue={nilai.kelengkungan}
                disabled={!canManage}
              />
              <FieldError messages={fieldErrors?.kelengkungan} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="heroJudul">Judul hero beranda</Label>
            <Input
              id="heroJudul"
              name="heroJudul"
              defaultValue={nilai.heroJudul}
              placeholder="Kosongkan untuk memakai nama desa"
              disabled={!canManage}
            />
            <FieldError messages={fieldErrors?.heroJudul} />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="heroTombol">Teks tombol utama</Label>
              <Input
                id="heroTombol"
                name="heroTombol"
                defaultValue={nilai.heroTombol}
                disabled={!canManage}
              />
              <FieldError messages={fieldErrors?.heroTombol} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroTombolUrl">Tautan tombol utama</Label>
              <Input
                id="heroTombolUrl"
                name="heroTombolUrl"
                defaultValue={nilai.heroTombolUrl}
                disabled={!canManage}
              />
              <FieldError messages={fieldErrors?.heroTombolUrl} />
            </div>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Bagian beranda</legend>
            <p className="text-xs text-muted-foreground">
              Centang bagian yang ingin ditampilkan. Kontak selalu tampil di akhir.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {BERANDA_OPTIONS.map((opsi) => (
                <label key={opsi.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="beranda"
                    value={opsi.value}
                    defaultChecked={nilai.beranda.includes(opsi.value)}
                    disabled={!canManage}
                    className="size-4 rounded border"
                  />
                  {opsi.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="tampilMenu"
                defaultChecked={nilai.tampilMenu}
                disabled={!canManage}
                className="size-4 rounded border"
              />
              Tampilkan menu navigasi di header
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="tampilKontakFooter"
                defaultChecked={nilai.tampilKontakFooter}
                disabled={!canManage}
                className="size-4 rounded border"
              />
              Tampilkan blok kontak di footer
            </label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="teksBerjalan">Teks berjalan</Label>
            <textarea
              id="teksBerjalan"
              name="teksBerjalan"
              rows={2}
              maxLength={300}
              defaultValue={nilai.teksBerjalan}
              placeholder="Contoh: Pelayanan kantor desa Senin–Jumat, 08.00–15.00 WIB."
              disabled={!canManage}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Tampil sebagai bilah informasi di bawah header. Kosongkan untuk menyembunyikan.
            </p>
            <FieldError messages={fieldErrors?.teksBerjalan} />
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Sosial media</legend>
            <p className="text-xs text-muted-foreground">
              Tautan yang diisi tampil sebagai ikon teks di footer situs publik.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {SOSMED_PLATFORMS.map((platform) => (
                <div key={platform} className="space-y-2">
                  <Label htmlFor={`sosmed_${platform}`}>{SOSMED_LABELS[platform]}</Label>
                  <Input
                    id={`sosmed_${platform}`}
                    name={`sosmed_${platform}`}
                    type="url"
                    inputMode="url"
                    defaultValue={
                      nilai.sosmed.find((item) => item.platform === platform)?.url ?? ""
                    }
                    placeholder="https://"
                    disabled={!canManage}
                  />
                  <FieldError messages={fieldErrors?.[`sosmed_${platform}`]} />
                </div>
              ))}
            </div>
          </fieldset>

          {canManage ? (
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              Simpan pengaturan tema
            </Button>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
