"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SASARAN_KELUARGA,
  type SuplemenListRow,
  type SuplemenOption,
  type SuplemenTerdataRow,
} from "@/features/penduduk/domain/suplemen";
import {
  addSuplemenTerdataAction,
  listSuplemenTerdataAction,
  removeSuplemenTerdataAction,
} from "@/features/penduduk/presentation/actions-suplemen";

export function SuplemenTerdataDialog({
  suplemen,
  pendudukOptions,
  keluargaOptions,
}: {
  suplemen: SuplemenListRow;
  pendudukOptions: SuplemenOption[];
  keluargaOptions: SuplemenOption[];
}) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<SuplemenTerdataRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isKeluarga = suplemen.sasaran === SASARAN_KELUARGA;
  const options = isKeluarga ? keluargaOptions : pendudukOptions;

  async function reload() {
    setLoading(true);
    const res = await listSuplemenTerdataAction(suplemen.id);
    setLoading(false);
    if (res.ok) {
      setRows(res.rows);
      setError(null);
    } else {
      setError(res.message);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) void reload();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Terdata ({suplemen.terdataCount})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Terdata — {suplemen.nama}</DialogTitle>
        </DialogHeader>

        <form
          action={async (formData) => {
            const res = await addSuplemenTerdataAction(formData);
            if (res.ok) {
              await reload();
            } else {
              setError(res.message);
            }
          }}
          className="flex items-end gap-2"
        >
          <input type="hidden" name="suplemenId" value={suplemen.id} />
          <div className="min-w-0 flex-1 space-y-2">
            <label className="text-sm font-medium">
              {isKeluarga ? "Pilih Keluarga" : "Pilih Penduduk"}
            </label>
            <Select
              name={isKeluarga ? "keluargaId" : "pendudukId"}
              required
              key={`${suplemen.id}-${suplemen.sasaran}`}
            >
              <SelectTrigger>
                <SelectValue placeholder={isKeluarga ? "Pilih KK" : "Pilih penduduk"} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.id} value={String(option.id)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit">Tambah</Button>
        </form>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {loading ? (
          <p className="text-sm text-muted-foreground">Memuat...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada sasaran terdata.</p>
        ) : (
          <div className="max-h-72 overflow-y-auto rounded-md border">
            <table className="w-full text-sm">
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="p-2">{row.label}</td>
                    <td className="p-2 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          const res = await removeSuplemenTerdataAction(row.id);
                          if (res.ok) await reload();
                          else setError(res.message);
                        }}
                      >
                        Hapus
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
