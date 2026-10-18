"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import {
  GENDER_LABELS,
  GENDERS,
  LIFE_STATUS_LABELS,
  LIFE_STATUSES,
  RESIDENCE_STATUS_LABELS,
  RESIDENCE_STATUSES,
  type PendudukDTO,
  type PendudukReferenceData,
  type ReferenceOption,
  type RegionOption,
} from "@/features/penduduk/domain/penduduk";
import { idleActionState } from "@/lib/action-state";
import { NO_SELECTION } from "@/lib/forms";

import { savePendudukAction } from "../actions";

interface PendudukFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reference: PendudukReferenceData;
  /** Bila diisi → mode ubah; bila kosong → mode tambah. */
  penduduk?: PendudukDTO | null;
}

/** Satu pilihan select: `value` dikirim ke server, `label` ditampilkan. */
interface SelectOption {
  value: string;
  label: string;
}

/** Ubah id numerik menjadi nilai select (atau `null` bila kosong). */
function idValue(id: number | null | undefined): string | null {
  return id === null || id === undefined ? null : String(id);
}

function catalogOptions(options: readonly ReferenceOption[]): SelectOption[] {
  return options.map((option) => ({ value: String(option.id), label: option.name }));
}

function labelOptions(options: readonly RegionOption[]): SelectOption[] {
  return options.map((option) => ({ value: String(option.id), label: option.label }));
}

/** Tampilkan pesan kesalahan validasi milik satu field. */
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

interface ReferenceSelectProps {
  label: string;
  name: string;
  options: readonly SelectOption[];
  /** Nilai terpilih; `null` berarti belum dipilih. */
  value: string | null;
  /** Label untuk pilihan kosong; `null` menyembunyikan pilihan kosong. */
  noneLabel: string | null;
}

/** Select tunggal yang terhubung otomatis dengan FormData lewat `name`. */
function ReferenceSelect({ label, name, options, value, noneLabel }: ReferenceSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Select name={name} defaultValue={value ?? NO_SELECTION}>
        <SelectTrigger id={name} className="w-full">
          <SelectValue placeholder="Pilih" />
        </SelectTrigger>
        <SelectContent>
          {noneLabel !== null ? <SelectItem value={NO_SELECTION}>{noneLabel}</SelectItem> : null}
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * Dialog formulir tambah/ubah penduduk (terkendali).
 *
 * Radix membongkar isi dialog saat tertutup, sehingga state `useActionState`
 * otomatis kembali bersih setiap kali dialog dibuka.
 */
export function PendudukFormDialog({
  open,
  onOpenChange,
  reference,
  penduduk,
}: PendudukFormDialogProps) {
  const isEdit = Boolean(penduduk);
  const [state, formAction, isPending] = useActionState(savePendudukAction, idleActionState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      onOpenChange(false);
    }
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Ubah Penduduk" : "Tambah Penduduk"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui data kependudukan warga."
              : "Catat data warga baru pada buku kependudukan desa."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {penduduk ? <input type="hidden" name="id" value={penduduk.id} /> : null}

          {state.status === "error" ? (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="max-h-[65vh] space-y-5 overflow-y-auto pr-1">
            <section className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Identitas</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nationalId">NIK</Label>
                  <Input
                    id="nationalId"
                    name="nationalId"
                    defaultValue={penduduk?.nationalId ?? ""}
                    placeholder="16 angka"
                    inputMode="numeric"
                    maxLength={16}
                    autoFocus
                    aria-invalid={Boolean(fieldErrors?.nationalId)}
                  />
                  <FieldError messages={fieldErrors?.nationalId} />
                </div>

                <ReferenceSelect
                  label="Kartu Keluarga"
                  name="familyId"
                  options={labelOptions(reference.families)}
                  value={idValue(penduduk?.familyId)}
                  noneLabel="— Belum ditautkan —"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={penduduk?.name ?? ""}
                    maxLength={100}
                    required
                    aria-invalid={Boolean(fieldErrors?.name)}
                  />
                  <FieldError messages={fieldErrors?.name} />
                </div>

                <ReferenceSelect
                  label="Jenis Kelamin"
                  name="gender"
                  options={GENDERS.map((gender) => ({
                    value: gender,
                    label: GENDER_LABELS[gender],
                  }))}
                  value={penduduk?.gender ?? null}
                  noneLabel="— Pilih —"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="birthPlace">Tempat Lahir</Label>
                  <Input
                    id="birthPlace"
                    name="birthPlace"
                    defaultValue={penduduk?.birthPlace ?? ""}
                    maxLength={100}
                    aria-invalid={Boolean(fieldErrors?.birthPlace)}
                  />
                  <FieldError messages={fieldErrors?.birthPlace} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">Tanggal Lahir</Label>
                  <Input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    defaultValue={penduduk?.birthDate ?? ""}
                    aria-invalid={Boolean(fieldErrors?.birthDate)}
                  />
                  <FieldError messages={fieldErrors?.birthDate} />
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Data Sosial</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <ReferenceSelect
                  label="Agama"
                  name="religionId"
                  options={catalogOptions(reference.religions)}
                  value={idValue(penduduk?.religionId)}
                  noneLabel="—"
                />
                <ReferenceSelect
                  label="Pendidikan Terakhir"
                  name="educationId"
                  options={catalogOptions(reference.educations)}
                  value={idValue(penduduk?.educationId)}
                  noneLabel="—"
                />
                <ReferenceSelect
                  label="Pekerjaan"
                  name="occupationId"
                  options={catalogOptions(reference.occupations)}
                  value={idValue(penduduk?.occupationId)}
                  noneLabel="—"
                />
                <ReferenceSelect
                  label="Status Perkawinan"
                  name="maritalStatusId"
                  options={catalogOptions(reference.maritalStatuses)}
                  value={idValue(penduduk?.maritalStatusId)}
                  noneLabel="—"
                />
                <ReferenceSelect
                  label="Hubungan dalam Keluarga"
                  name="familyRelationId"
                  options={catalogOptions(reference.familyRelations)}
                  value={idValue(penduduk?.familyRelationId)}
                  noneLabel="—"
                />
                <ReferenceSelect
                  label="Golongan Darah"
                  name="bloodTypeId"
                  options={catalogOptions(reference.bloodTypes)}
                  value={idValue(penduduk?.bloodTypeId)}
                  noneLabel="—"
                />
                <ReferenceSelect
                  label="Kewarganegaraan"
                  name="citizenshipId"
                  options={catalogOptions(reference.citizenships)}
                  value={idValue(penduduk?.citizenshipId)}
                  noneLabel="—"
                />
                <ReferenceSelect
                  label="Status Tempat Tinggal"
                  name="residenceStatus"
                  options={RESIDENCE_STATUSES.map((status) => ({
                    value: status,
                    label: RESIDENCE_STATUS_LABELS[status],
                  }))}
                  value={penduduk?.residenceStatus ?? "permanent"}
                  noneLabel={null}
                />
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Domisili</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <ReferenceSelect
                  label="Wilayah"
                  name="regionId"
                  options={labelOptions(reference.regions)}
                  value={idValue(penduduk?.regionId)}
                  noneLabel="—"
                />
                <ReferenceSelect
                  label="Status Kependudukan"
                  name="lifeStatus"
                  options={LIFE_STATUSES.map((status) => ({
                    value: status,
                    label: LIFE_STATUS_LABELS[status],
                  }))}
                  value={penduduk?.lifeStatus ?? "alive"}
                  noneLabel={null}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Alamat</Label>
                <Input
                  id="address"
                  name="address"
                  defaultValue={penduduk?.address ?? ""}
                  maxLength={255}
                  aria-invalid={Boolean(fieldErrors?.address)}
                />
                <FieldError messages={fieldErrors?.address} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telepon</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={penduduk?.phone ?? ""}
                    maxLength={30}
                    aria-invalid={Boolean(fieldErrors?.phone)}
                  />
                  <FieldError messages={fieldErrors?.phone} />
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Data Orang Tua</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fatherName">Nama Ayah</Label>
                  <Input
                    id="fatherName"
                    name="fatherName"
                    defaultValue={penduduk?.fatherName ?? ""}
                    maxLength={100}
                    aria-invalid={Boolean(fieldErrors?.fatherName)}
                  />
                  <FieldError messages={fieldErrors?.fatherName} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motherName">Nama Ibu</Label>
                  <Input
                    id="motherName"
                    name="motherName"
                    defaultValue={penduduk?.motherName ?? ""}
                    maxLength={100}
                    aria-invalid={Boolean(fieldErrors?.motherName)}
                  />
                  <FieldError messages={fieldErrors?.motherName} />
                </div>
              </div>
            </section>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              {isEdit ? "Simpan perubahan" : "Tambah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
