"use client";

import { useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ISIAN_FIELD_PREFIX, type IsianField } from "@/features/surat/domain/isian";

interface IsianFieldsProps {
  /** Daftar isian sesuai jenis surat terpilih. */
  fields: readonly IsianField[];
  /** Nilai tersimpan (untuk mode ubah). */
  values?: Readonly<Record<string, string>>;
  /** Kesalahan per-field dari server (`isian.<kode>`). */
  errors?: Readonly<Record<string, string[]>>;
}

/**
 * Formulir isian dinamis untuk surat.
 *
 * Nama field dikirim sebagai `isian.<kode>` supaya server dapat membedakan
 * isian per jenis surat tanpa perlu kolom terpisah.
 */
export function IsianFields({ fields, values = {}, errors = {} }: IsianFieldsProps) {
  const fieldKey = fields.map((field) => field.kode).join("|");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [lastKey, setLastKey] = useState(fieldKey);

  // when daftar isian berubah (jenis surat diganti), kosongkan centang.
  if (lastKey !== fieldKey) {
    setLastKey(fieldKey);
    setChecked({});
  }

  if (fields.length === 0) return null;

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div>
        <p className="text-sm font-medium">Isian Surat</p>
        <p className="text-xs text-muted-foreground">
          Isian khusus jenis surat ini. Nilai disimpan pada surat dan bisa disisipkan ke badan surat
          memakai <code>[kode_isian]</code>.
        </p>
      </div>

      {fields.map((field) => {
        const name = `${ISIAN_FIELD_PREFIX}${field.kode}`;
        const fieldErrors = errors[name];
        const value = values[field.kode] ?? "";

        return (
          <div key={field.kode} className="space-y-2">
            <Label htmlFor={name}>
              {field.label}
              {field.required ? <span className="text-destructive"> *</span> : null}
            </Label>

            {field.tipe === "textarea" ? (
              <Textarea
                id={name}
                name={name}
                rows={3}
                defaultValue={value}
                placeholder={field.placeholder}
                aria-invalid={Boolean(fieldErrors)}
              />
            ) : field.tipe === "select" ? (
              <select
                id={name}
                name={name}
                defaultValue={value}
                className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive md:text-sm"
              >
                <option value="">— Pilih —</option>
                {field.opsi.map((opsi) => (
                  <option key={opsi} value={opsi}>
                    {opsi}
                  </option>
                ))}
              </select>
            ) : field.tipe === "checkbox" ? (
              <div className="flex items-center gap-2">
                <Checkbox
                  id={name}
                  checked={checked[field.kode] ?? value === "Ya"}
                  onCheckedChange={(state) =>
                    setChecked((prev) => ({ ...prev, [field.kode]: state === true }))
                  }
                />
                <input
                  type="hidden"
                  name={name}
                  value={(checked[field.kode] ?? value === "Ya") ? "true" : "false"}
                />
                <span className="text-sm text-muted-foreground">Ya</span>
              </div>
            ) : (
              <Input
                id={name}
                name={name}
                type={field.tipe === "number" ? "number" : field.tipe === "date" ? "date" : "text"}
                defaultValue={value}
                placeholder={field.placeholder}
                aria-invalid={Boolean(fieldErrors)}
              />
            )}

            {fieldErrors?.map((message) => (
              <p key={message} className="text-xs text-destructive">
                {message}
              </p>
            ))}
          </div>
        );
      })}
    </div>
  );
}
