"use client";

import { Download } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deleteKiaAction, saveKiaAction } from "@/features/kesehatan/presentation/actions-kia";

export interface KiaTableRow {
  id: number;
  noKia: string;
  ibuId: number;
  anakId: number | null;
  hariPerkiraanLahir: string | null;
  ibuName?: string | null;
  anakName?: string | null;
  posyanduId?: number;
}

interface Option {
  id: number;
  label: string;
}

function KiaDialog({
  row,
  posyanduOptions,
  pendudukOptions,
  trigger,
}: {
  row?: KiaTableRow | undefined;
  posyanduOptions: Option[];
  pendudukOptions: Option[];
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{row ? "Ubah KIA" : "Tambah KIA"}</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            const res = await saveKiaAction(formData);
            if (res.ok) setOpen(false);
            else setError(res.message ?? "Gagal menyimpan.");
          }}
          className="space-y-3"
        >
          {row && <input type="hidden" name="id" value={row.id} />}
          <div className="space-y-2">
            <label className="text-sm font-medium">No. KIA</label>
            <Input name="noKia" required defaultValue={row?.noKia ?? ""} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Ibu</label>
            <Select name="ibuId" defaultValue={row ? String(row.ibuId) : undefined} required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih ibu" />
              </SelectTrigger>
              <SelectContent>
                {pendudukOptions.map((option) => (
                  <SelectItem key={option.id} value={String(option.id)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Anak (opsional)</label>
            <Select name="anakId" defaultValue={row?.anakId ? String(row.anakId) : undefined}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih anak" />
              </SelectTrigger>
              <SelectContent>
                {pendudukOptions.map((option) => (
                  <SelectItem key={option.id} value={String(option.id)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Hari Perkiraan Lahir</label>
            <Input
              type="date"
              name="hariPerkiraanLahir"
              defaultValue={row?.hariPerkiraanLahir ?? ""}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Posyandu</label>
            <Select
              name="posyanduId"
              defaultValue={row?.posyanduId !== undefined ? String(row.posyanduId) : undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih posyandu" />
              </SelectTrigger>
              <SelectContent>
                {posyanduOptions.map((option) => (
                  <SelectItem key={option.id} value={String(option.id)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit">Simpan</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function KiaTable({
  rows,
  pendudukOptions,
  posyanduOptions,
  canManage,
}: {
  rows: KiaTableRow[];
  pendudukOptions: Option[];
  posyanduOptions: Option[];
  canManage: boolean;
}) {
  const [selectedPosyandu, setSelectedPosyandu] = useState<string>("");
  const label = (id: number) =>
    pendudukOptions.find((option) => option.id === id)?.label ?? String(id);

  const filteredRows = selectedPosyandu
    ? rows.filter((row) => row.posyanduId === Number(selectedPosyandu))
    : rows;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        {canManage && (
          <KiaDialog
            posyanduOptions={posyanduOptions}
            pendudukOptions={pendudukOptions}
            trigger={<Button>Tambah KIA</Button>}
          />
        )}
        <div className="flex items-center gap-2">
          <Select value={selectedPosyandu} onValueChange={setSelectedPosyandu}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter Posyandu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua Posyandu</SelectItem>
              {posyanduOptions.map((opt) => (
                <SelectItem key={opt.id} value={String(opt.id)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" asChild className="ml-auto">
          <Link href="/kesehatan/kia/ekspor">
            <Download className="mr-2 h-4 w-4" />
            Ekspor CSV
          </Link>
        </Button>
      </div>
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-2 text-left">No KIA</th>
                <th className="p-2 text-left">Ibu</th>
                <th className="p-2 text-left">Anak</th>
                <th className="p-2 text-left">HPHT</th>
                {canManage && <th className="p-2 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id} className="border-b">
                  <td className="p-2">{row.noKia}</td>
                  <td className="p-2">{row.ibuName ?? label(row.ibuId)}</td>
                  <td className="p-2">{row.anakName ?? (row.anakId ? label(row.anakId) : "-")}</td>
                  <td className="p-2">{row.hariPerkiraanLahir ?? "-"}</td>
                  {canManage && (
                    <td className="p-2">
                      <div className="flex justify-end gap-1">
                        <KiaDialog
                          row={row}
                          posyanduOptions={[]}
                          pendudukOptions={pendudukOptions}
                          trigger={
                            <Button variant="ghost" size="sm">
                              Ubah
                            </Button>
                          }
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={async () => {
                            if (!confirm(`Hapus KIA "${row.noKia}"?`)) return;
                            const res = await deleteKiaAction(row.id);
                            if (!res.ok) alert(res.message);
                          }}
                        >
                          Hapus
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td className="p-2 text-muted-foreground" colSpan={canManage ? 5 : 4}>
                    Belum ada data KIA.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
