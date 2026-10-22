"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ISIAN_TIPE_LABELS,
  ISIAN_TIPES,
  type IsianField,
  type IsianTipe,
} from "@/features/surat/domain/isian";

interface IsianBuilderProps {
  /** Isian yang sudah tersimpan (hasil parse JSON). */
  initialFields: readonly IsianField[];
  /** Nama field tersembunyi yang menyimpan JSON isian. */
  name?: string;
}

interface EditableField {
  kode: string;
  label: string;
  tipe: IsianTipe;
  required: boolean;
  opsi: string;
  placeholder: string;
}

function toEditable(field: IsianField): EditableField {
  return {
    kode: field.kode,
    label: field.label,
    tipe: field.tipe,
    required: field.required,
    opsi: field.opsi.join(", "),
    placeholder: field.placeholder ?? "",
  };
}

/**
 * Editor isian dinamis untuk jenis surat.
 *
 * Daftar isian disimpan sebagai JSON pada `letter_types.form_isian`; kode
 * isian dipakai sebagai placeholder pada badan surat, mis. `[nama_proyek]`.
 */
export function IsianBuilder({ initialFields, name = "formIsian" }: IsianBuilderProps) {
  const [fields, setFields] = useState<EditableField[]>(() => initialFields.map(toEditable));

  function update(index: number, patch: Partial<EditableField>) {
    setFields((prev) =>
      prev.map((field, position) => (position === index ? { ...field, ...patch } : field)),
    );
  }

  function remove(index: number) {
    setFields((prev) => prev.filter((_, position) => position !== index));
  }

  function add() {
    setFields((prev) => [
      ...prev,
      { kode: "", label: "", tipe: "text", required: false, opsi: "", placeholder: "" },
    ]);
  }

  const serialized = JSON.stringify(
    fields
      .filter((field) => field.kode.trim() !== "" && field.label.trim() !== "")
      .map((field) => ({
        kode: field.kode.trim(),
        label: field.label.trim(),
        tipe: field.tipe,
        required: field.required,
        opsi:
          field.tipe === "select"
            ? field.opsi
                .split(",")
                .map((item) => item.trim())
                .filter((item) => item !== "")
            : [],
        ...(field.placeholder.trim() === "" ? {} : { placeholder: field.placeholder.trim() }),
      })),
  );

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium">Isian Dinamis</p>
          <p className="text-xs text-muted-foreground">
            Isian tambahan yang muncul pada formulir surat. Nilainya bisa disisipkan ke badan surat
            memakai <code>[kode_isian]</code>.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="size-4" />
          Tambah Isian
        </Button>
      </div>

      <input type="hidden" name={name} value={serialized} />

      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">Belum ada isian tambahan.</p>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={index} className="rounded-lg border p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor={`isian-kode-${index}`}>Kode</Label>
                  <Input
                    id={`isian-kode-${index}`}
                    value={field.kode}
                    onChange={(event) => update(index, { kode: event.target.value })}
                    placeholder="nama_proyek"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Huruf kecil, angka, dan garis bawah.
                  </p>
                </div>

                <div className="space-y-1">
                  <Label htmlFor={`isian-label-${index}`}>Label</Label>
                  <Input
                    id={`isian-label-${index}`}
                    value={field.label}
                    onChange={(event) => update(index, { label: event.target.value })}
                    placeholder="Nama proyek"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor={`isian-tipe-${index}`}>Tipe</Label>
                  <select
                    id={`isian-tipe-${index}`}
                    value={field.tipe}
                    onChange={(event) => update(index, { tipe: event.target.value as IsianTipe })}
                    className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
                  >
                    {ISIAN_TIPES.map((tipe) => (
                      <option key={tipe} value={tipe}>
                        {ISIAN_TIPE_LABELS[tipe]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor={`isian-placeholder-${index}`}>Placeholder</Label>
                  <Input
                    id={`isian-placeholder-${index}`}
                    value={field.placeholder}
                    onChange={(event) => update(index, { placeholder: event.target.value })}
                    placeholder="Contoh isian"
                  />
                </div>

                {field.tipe === "select" ? (
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor={`isian-opsi-${index}`}>Pilihan</Label>
                    <Input
                      id={`isian-opsi-${index}`}
                      value={field.opsi}
                      onChange={(event) => update(index, { opsi: event.target.value })}
                      placeholder="Ya, Tidak, Mungkin"
                    />
                    <p className="text-xs text-muted-foreground">
                      Pisahkan pilihan dengan tanda koma.
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`isian-required-${index}`}
                    checked={field.required}
                    onCheckedChange={(state) => update(index, { required: state === true })}
                  />
                  <Label htmlFor={`isian-required-${index}`} className="font-normal">
                    Wajib diisi
                  </Label>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Hapus isian ${field.label || field.kode}`}
                  onClick={() => remove(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
