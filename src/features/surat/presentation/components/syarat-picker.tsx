"use client";

import { useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { serializeSyaratIds, type SyaratSuratDTO } from "@/features/surat/domain/isian";

interface SyaratPickerProps {
  /** Master syarat surat desa. */
  syarat: readonly SyaratSuratDTO[];
  /** Id syarat yang sudah terpasang pada jenis surat. */
  initialIds: readonly number[];
  /** Nama field tersembunyi yang menyimpan JSON daftar id syarat. */
  name?: string;
}

/**
 * Pemilih syarat surat untuk jenis surat.
 *
 * Daftar id disimpan sebagai JSON (parity `tweb_surat_format.syarat_surat`).
 */
export function SyaratPicker({ syarat, initialIds, name = "syaratSurat" }: SyaratPickerProps) {
  const [selected, setSelected] = useState<number[]>(() => [...initialIds]);

  function toggle(id: number, checked: boolean) {
    setSelected((prev) => (checked ? [...prev, id] : prev.filter((item) => item !== id)));
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div>
        <p className="text-sm font-medium">Syarat Surat</p>
        <p className="text-xs text-muted-foreground">
          Kelengkapan berkas yang diminta untuk jenis surat ini.
        </p>
      </div>

      <input type="hidden" name={name} value={serializeSyaratIds(selected)} />

      {syarat.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Belum ada master syarat surat. Tambahkan lewat halaman Syarat Surat.
        </p>
      ) : (
        <ul className="space-y-2">
          {syarat.map((item) => {
            const id = `syarat-${item.id}`;
            const checked = selected.includes(item.id);

            return (
              <li key={item.id} className="flex items-start gap-2">
                <Checkbox
                  id={id}
                  checked={checked}
                  onCheckedChange={(state) => toggle(item.id, state === true)}
                />
                <div className="grid gap-0.5">
                  <Label htmlFor={id} className="font-normal">
                    {item.name}
                  </Label>
                  {item.description ? (
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
