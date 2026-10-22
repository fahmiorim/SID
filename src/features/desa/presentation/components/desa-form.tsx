"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

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
import type { IdentitasDesaDTO } from "@/features/desa/domain/desa";
import {
  normalizePenomoranMode,
  PENOMORAN_SURAT_LABELS,
  PENOMORAN_SURAT_MODES,
} from "@/features/surat/domain/penomoran";
import { idleActionState } from "@/lib/action-state";

import { saveIdentitasDesaAction } from "../actions";

interface DesaFormProps {
  desa: IdentitasDesaDTO | null;
  canManage: boolean;
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

/** Formulir identitas desa. */
export function DesaForm({ desa, canManage }: DesaFormProps) {
  const [state, formAction, isPending] = useActionState(saveIdentitasDesaAction, idleActionState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      {state.status === "error" && state.fieldErrors === undefined ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-lg font-semibold">Umum</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="namaDesa">Nama Desa</Label>
              <Input
                id="namaDesa"
                name="namaDesa"
                defaultValue={desa?.namaDesa ?? ""}
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kodeDesa">Kode Desa</Label>
              <Input
                id="kodeDesa"
                name="kodeDesa"
                defaultValue={desa?.kodeDesa ?? ""}
                maxLength={10}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kodePos">Kode Pos</Label>
              <Input id="kodePos" name="kodePos" defaultValue={desa?.kodePos ?? ""} maxLength={5} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alamatKantor">Alamat Kantor</Label>
              <Input
                id="alamatKantor"
                name="alamatKantor"
                defaultValue={desa?.alamatKantor ?? ""}
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="namaKepalaDesa">Nama Kepala Desa</Label>
              <Input
                id="namaKepalaDesa"
                name="namaKepalaDesa"
                defaultValue={desa?.namaKepalaDesa ?? ""}
                maxLength={100}
                placeholder="Dipakai pada tanda tangan surat"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nipKepalaDesa">NIP/NIAP Kepala Desa</Label>
              <Input
                id="nipKepalaDesa"
                name="nipKepalaDesa"
                defaultValue={desa?.nipKepalaDesa ?? ""}
                maxLength={30}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-lg font-semibold">Wilayah</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="namaKecamatan">Nama Kecamatan</Label>
              <Input
                id="namaKecamatan"
                name="namaKecamatan"
                defaultValue={desa?.namaKecamatan ?? ""}
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kodeKecamatan">Kode Kecamatan</Label>
              <Input
                id="kodeKecamatan"
                name="kodeKecamatan"
                defaultValue={desa?.kodeKecamatan ?? ""}
                maxLength={10}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="namaKabupaten">Nama Kabupaten/Kota</Label>
              <Input
                id="namaKabupaten"
                name="namaKabupaten"
                defaultValue={desa?.namaKabupaten ?? ""}
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kodeKabupaten">Kode Kabupaten/Kota</Label>
              <Input
                id="kodeKabupaten"
                name="kodeKabupaten"
                defaultValue={desa?.kodeKabupaten ?? ""}
                maxLength={10}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="namaPropinsi">Nama Provinsi</Label>
              <Input
                id="namaPropinsi"
                name="namaPropinsi"
                defaultValue={desa?.namaPropinsi ?? ""}
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kodePropinsi">Kode Provinsi</Label>
              <Input
                id="kodePropinsi"
                name="kodePropinsi"
                defaultValue={desa?.kodePropinsi ?? ""}
                maxLength={10}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-lg font-semibold">Kontak & Media</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="emailDesa">Email Desa</Label>
              <Input
                id="emailDesa"
                name="emailDesa"
                type="email"
                defaultValue={desa?.emailDesa ?? ""}
                maxLength={100}
                aria-invalid={Boolean(fieldErrors?.emailDesa)}
              />
              <FieldError messages={fieldErrors?.emailDesa} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telepon">Telepon</Label>
              <Input
                id="telepon"
                name="telepon"
                type="tel"
                defaultValue={desa?.telepon ?? ""}
                maxLength={30}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                defaultValue={desa?.website ?? ""}
                maxLength={150}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo">Logo (URL)</Label>
              <Input id="logo" name="logo" defaultValue={desa?.logo ?? ""} maxLength={150} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-lg font-semibold">Persuratan</h2>
          <div className="max-w-xl space-y-2">
            <Label htmlFor="penomoranSurat">Mode Penomoran Surat</Label>
            <Select
              name="penomoranSurat"
              defaultValue={String(normalizePenomoranMode(desa?.penomoranSurat))}
              disabled={!canManage}
            >
              <SelectTrigger id="penomoranSurat" className="w-full">
                <SelectValue placeholder="Pilih mode penomoran" />
              </SelectTrigger>
              <SelectContent>
                {PENOMORAN_SURAT_MODES.map((mode) => (
                  <SelectItem key={mode} value={String(mode)}>
                    {PENOMORAN_SURAT_LABELS[mode]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Menentukan cara nomor urut surat layanan dihitung. Mode 3 memakai nomor agenda surat
              masuk/keluar; mode 4 memerlukan klasifikasi pada jenis surat.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending || !canManage}>
          {isPending ? <Loader2 className="animate-spin" /> : null}
          Simpan
        </Button>
      </div>
    </form>
  );
}
