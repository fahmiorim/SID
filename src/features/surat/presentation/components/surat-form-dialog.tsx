"use client";

import { AlertCircle, Loader2, Plus, Trash2 } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseIsianFields, parseNilaiIsian } from "@/features/surat/domain/isian";
import {
  KUNCI_ISIAN_LUAR,
  KUNCI_ISIAN_PENGIKUT,
  MAKS_PENDUDUK_LUAR,
  MAKS_PENGIKUT,
  parsePendudukLuar,
  parsePengikutIds,
} from "@/features/surat/domain/pengikut";
import type { JenisSuratDTO, SuratListRow } from "@/features/surat/domain/surat";
import { createIdleActionState } from "@/lib/action-state";
import { NO_SELECTION, todayIsoDate } from "@/lib/forms";

import { saveSuratAction } from "../actions";
import { IsianFields } from "./isian-fields";

interface PendudukOption {
  id: number;
  name: string;
  nationalId: string | null;
}

interface SuratFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jenis: JenisSuratDTO[];
  penduduk: PendudukOption[];
  surat?: SuratListRow | null;
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

export function SuratFormDialog({
  open,
  onOpenChange,
  jenis,
  penduduk,
  surat,
}: SuratFormDialogProps) {
  const isEdit = Boolean(surat);
  const [state, formAction, isPending] = useActionState(saveSuratAction, createIdleActionState());
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;
  const [typeId, setTypeId] = useState(surat ? String(surat.typeId) : "");

  const activeJenis = jenis.find((item) => String(item.id) === typeId);
  const isianFields = parseIsianFields(activeJenis?.formIsian);
  const isianValues = parseNilaiIsian(surat?.nilaiIsian);

  // Pengikut penduduk desa & baris penduduk luar (Fase 2E) — nilai awal dari
  // kunci tersembunyi `__pengikut`/`__luar` pada konsep tersimpan (satu komponen
  // per baris surat, jadi inisialisasi sekali saat mount cukup).
  const [pengikutTerpilih, setPengikutTerpilih] = useState<number[]>(() =>
    surat ? parsePengikutIds(parseNilaiIsian(surat.nilaiIsian)[KUNCI_ISIAN_PENGIKUT]) : [],
  );
  const [jumlahLuar, setJumlahLuar] = useState<number>(() =>
    surat ? parsePendudukLuar(parseNilaiIsian(surat.nilaiIsian)[KUNCI_ISIAN_LUAR]).length : 0,
  );

  function togglePengikut(id: number, dicentang: boolean) {
    setPengikutTerpilih((lama) => {
      if (dicentang) {
        if (lama.includes(id) || lama.length >= MAKS_PENGIKUT) return lama;
        return [...lama, id];
      }
      return lama.filter((item) => item !== id);
    });
  }

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      onOpenChange(false);
    }
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Ubah Konsep Surat" : "Buat Surat Baru"}</DialogTitle>
          <DialogDescription>
            Surat disimpan sebagai konsep. Nomor surat diberikan otomatis saat diterbitkan.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {surat ? <input type="hidden" name="id" value={surat.id} /> : null}

          {state.status === "error" && !fieldErrors ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="typeId">Jenis Surat</Label>
            <Select name="typeId" value={typeId} onValueChange={setTypeId}>
              <SelectTrigger id="typeId" className="w-full">
                <SelectValue placeholder="Pilih jenis surat" />
              </SelectTrigger>
              <SelectContent>
                {jenis.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.name} ({item.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError messages={fieldErrors?.typeId} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="residentId">Penduduk</Label>
            <Select
              name="residentId"
              defaultValue={surat?.residentId ? String(surat.residentId) : NO_SELECTION}
            >
              <SelectTrigger id="residentId" className="w-full">
                <SelectValue placeholder="Pilih penduduk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_SELECTION}>— Tidak ada —</SelectItem>
                {penduduk.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.name}
                    {item.nationalId ? ` — ${item.nationalId}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Wajib untuk jenis surat yang membutuhkan data penduduk.
            </p>
            <FieldError messages={fieldErrors?.residentId} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="letterDate">Tanggal Surat</Label>
              <Input
                id="letterDate"
                name="letterDate"
                type="date"
                defaultValue={surat?.letterDate ?? todayIsoDate()}
                required
                aria-invalid={Boolean(fieldErrors?.letterDate)}
              />
              <FieldError messages={fieldErrors?.letterDate} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Keperluan</Label>
              <Input
                id="purpose"
                name="purpose"
                defaultValue={surat?.purpose ?? ""}
                maxLength={255}
                placeholder="Mis. pengurusan SKCK"
                aria-invalid={Boolean(fieldErrors?.purpose)}
              />
              <FieldError messages={fieldErrors?.purpose} />
            </div>
          </div>

          <IsianFields fields={isianFields} values={isianValues} errors={fieldErrors} />

          {/* Pengikut: penduduk desa yang menyertai surat (placeholder
              `pengikut<n>_*`, `pengikut_daftar`, `pengikut_jumlah`). */}
          <div className="space-y-2 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <Label className="font-medium">Pengikut (penduduk desa)</Label>
              <span className="text-xs text-muted-foreground">
                {pengikutTerpilih.length}/{MAKS_PENGIKUT}
              </span>
            </div>
            <div className="grid max-h-44 gap-1 overflow-auto" data-testid="pengikut-list">
              {penduduk.length === 0 ? (
                <p className="text-xs text-muted-foreground">Tidak ada penduduk terdaftar.</p>
              ) : (
                penduduk.map((item) => (
                  <label key={item.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={pengikutTerpilih.includes(item.id)}
                      onCheckedChange={(value) => togglePengikut(item.id, value === true)}
                    />
                    <span className="truncate">
                      {item.name}
                      {item.nationalId ? (
                        <span className="text-muted-foreground"> — {item.nationalId}</span>
                      ) : null}
                    </span>
                  </label>
                ))
              )}
            </div>
            {/* Nilai terkirim sesuai centang pada saat formulir dibuka. */}
            {pengikutTerpilih.map((id) => (
              <input key={`pengikut-${id}`} type="hidden" name="pengikut" value={id} />
            ))}
            <p className="text-xs text-muted-foreground">
              Pengikut dicetak lewat placeholder [pengikut1_nama], [pengikut_daftar], dst.
            </p>
          </div>

          {/* Penduduk luar desa: diisi manual (placeholder `luar<n>_*`). */}
          <div className="space-y-2 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <Label className="font-medium">Penduduk Luar Desa</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={jumlahLuar >= MAKS_PENDUDUK_LUAR}
                onClick={() => setJumlahLuar((n) => n + 1)}
              >
                <Plus className="size-4" />
                Tambah Baris
              </Button>
            </div>
            {jumlahLuar === 0 ? (
              <p className="text-xs text-muted-foreground">
                Untuk orang di luar database penduduk desa (mis. mertua dari desa lain).
              </p>
            ) : null}
            <input type="hidden" name="luar_jumlah" value={jumlahLuar} />
            <div className="space-y-3">
              {Array.from({ length: jumlahLuar }, (_, i) => i + 1).map((n) => (
                <div key={`luar-${n}`} className="rounded-md border bg-muted/30 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">Baris {n}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`Hapus baris ${n}`}
                      onClick={() => setJumlahLuar((jumlah) => Math.max(0, jumlah - 1))}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor={`luar_nama_${n}`}>Nama *</Label>
                      <Input id={`luar_nama_${n}`} name={`luar_nama_${n}`} maxLength={100} />
                      <FieldError messages={fieldErrors?.[`luar_nama_${n}`]} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`luar_nik_${n}`}>NIK</Label>
                      <Input id={`luar_nik_${n}`} name={`luar_nik_${n}`} maxLength={30} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`luar_jenis_kelamin_${n}`}>Jenis Kelamin</Label>
                      <Input
                        id={`luar_jenis_kelamin_${n}`}
                        name={`luar_jenis_kelamin_${n}`}
                        maxLength={20}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`luar_pekerjaan_${n}`}>Pekerjaan</Label>
                      <Input
                        id={`luar_pekerjaan_${n}`}
                        name={`luar_pekerjaan_${n}`}
                        maxLength={100}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`luar_tempat_lahir_${n}`}>Tempat Lahir</Label>
                      <Input
                        id={`luar_tempat_lahir_${n}`}
                        name={`luar_tempat_lahir_${n}`}
                        maxLength={100}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`luar_tanggal_lahir_${n}`}>Tanggal Lahir (teks)</Label>
                      <Input
                        id={`luar_tanggal_lahir_${n}`}
                        name={`luar_tanggal_lahir_${n}`}
                        maxLength={30}
                        placeholder="Mis. 12 Januari 1990"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label htmlFor={`luar_alamat_${n}`}>Alamat</Label>
                      <Input id={`luar_alamat_${n}`} name={`luar_alamat_${n}`} maxLength={200} />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label htmlFor={`luar_keterangan_${n}`}>Keterangan</Label>
                      <Input
                        id={`luar_keterangan_${n}`}
                        name={`luar_keterangan_${n}`}
                        maxLength={150}
                        placeholder="Mis. mertua"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Dicetak lewat placeholder [luar1_nama], [luar1_nik], [luar_daftar], dst.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              {isEdit ? "Simpan Perubahan" : "Simpan Konsep"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
