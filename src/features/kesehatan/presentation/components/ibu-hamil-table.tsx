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
import { STATUS_KEHAMILAN } from "@/features/kesehatan/domain/kesehatan";
import {
  deleteIbuHamilAction,
  saveIbuHamilAction,
} from "@/features/kesehatan/presentation/actions-ibu-hamil";

export interface IbuHamilRow {
  id: number;
  posyanduId: number;
  kiaId: number;
  statusKehamilan: number | null;
  usiaKehamilan: number | null;
  tanggalMelahirkan: string | null;
  pemeriksaanKehamilan: boolean;
  konsumsiPilFe: boolean;
  butirPilFe: number | null;
  pemeriksaanNifas: boolean;
  konselingGizi: boolean;
  kunjunganRumah: boolean;
  aksesAirBersih: boolean;
  kepemilikanJamban: boolean;
  jaminanKesehatan: boolean;
}

interface Option {
  id: number;
  label: string;
}

const CHECKS = [
  ["pemeriksaanKehamilan", "Pemeriksaan kehamilan"],
  ["konsumsiPilFe", "Konsumsi pil Fe"],
  ["pemeriksaanNifas", "Pemeriksaan nifas"],
  ["konselingGizi", "Konseling gizi"],
  ["kunjunganRumah", "Kunjungan rumah"],
  ["aksesAirBersih", "Akses air bersih"],
  ["kepemilikanJamban", "Kepemilikan jamban"],
  ["jaminanKesehatan", "Jaminan kesehatan"],
] as const;

function IbuHamilDialog({
  row,
  posyanduOptions,
  kiaOptions,
  trigger,
}: {
  row?: IbuHamilRow;
  posyanduOptions: Option[];
  kiaOptions: Option[];
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {row ? "Ubah Pemantauan Ibu Hamil" : "Tambah Pemantauan Ibu Hamil"}
          </DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            const res = await saveIbuHamilAction(formData);
            if (res.ok) setOpen(false);
            else setError(res.message ?? "Gagal menyimpan.");
          }}
          className="space-y-3"
        >
          {row && <input type="hidden" name="id" value={row.id} />}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Posyandu</label>
              <Select
                name="posyanduId"
                defaultValue={row ? String(row.posyanduId) : undefined}
                required
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
            <div className="space-y-2">
              <label className="text-sm font-medium">KIA</label>
              <Select name="kiaId" defaultValue={row ? String(row.kiaId) : undefined} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih KIA" />
                </SelectTrigger>
                <SelectContent>
                  {kiaOptions.map((option) => (
                    <SelectItem key={option.id} value={String(option.id)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status Kehamilan</label>
              <Select
                name="statusKehamilan"
                defaultValue={row?.statusKehamilan ? String(row.statusKehamilan) : undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_KEHAMILAN.map((status) => (
                    <SelectItem key={status.value} value={String(status.value)}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Usia Kehamilan (minggu)</label>
              <Input
                type="number"
                min={0}
                max={42}
                name="usiaKehamilan"
                defaultValue={row?.usiaKehamilan ?? ""}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tanggal Melahirkan</label>
              <Input
                type="date"
                name="tanggalMelahirkan"
                defaultValue={row?.tanggalMelahirkan ?? ""}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Butir Pil Fe</label>
              <Input type="number" min={0} name="butirPilFe" defaultValue={row?.butirPilFe ?? ""} />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {CHECKS.map(([name, label]) => (
              <label key={name} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name={name}
                  defaultChecked={row ? row[name] : false}
                  className="size-4"
                />
                {label}
              </label>
            ))}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit">Simpan</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function IbuHamilTable({
  rows,
  posyanduOptions,
  kiaOptions,
  canManage,
}: {
  rows: IbuHamilRow[];
  posyanduOptions: Option[];
  kiaOptions: Option[];
  canManage: boolean;
}) {
  const [selectedPosyandu, setSelectedPosyandu] = useState<string>("");
  const label = (options: Option[], id: number) =>
    options.find((option) => option.id === id)?.label ?? String(id);

  const filteredRows = selectedPosyandu
    ? rows.filter((row) => row.posyanduId === Number(selectedPosyandu))
    : rows;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        {canManage && (
          <IbuHamilDialog
            posyanduOptions={posyanduOptions}
            kiaOptions={kiaOptions}
            trigger={<Button>Tambah Pemantauan</Button>}
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
          <Link href="/kesehatan/ibu-hamil/ekspor">
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
                <th className="p-2 text-left">KIA</th>
                <th className="p-2 text-left">Posyandu</th>
                <th className="p-2 text-left">Status Kehamilan</th>
                <th className="p-2 text-left">Usia</th>
                <th className="p-2 text-left">Tgl Melahirkan</th>
                {canManage && <th className="p-2 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id} className="border-b">
                  <td className="p-2">{label(kiaOptions, row.kiaId)}</td>
                  <td className="p-2">{label(posyanduOptions, row.posyanduId)}</td>
                  <td className="p-2">
                    {STATUS_KEHAMILAN.find((status) => status.value === row.statusKehamilan)
                      ?.label ?? "-"}
                  </td>
                  <td className="p-2">{row.usiaKehamilan ?? "-"}</td>
                  <td className="p-2">{row.tanggalMelahirkan ?? "-"}</td>
                  {canManage && (
                    <td className="p-2">
                      <div className="flex justify-end gap-1">
                        <IbuHamilDialog
                          row={row}
                          posyanduOptions={posyanduOptions}
                          kiaOptions={kiaOptions}
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
                            if (!confirm("Hapus data pemantauan ini?")) return;
                            const res = await deleteIbuHamilAction(row.id);
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
                  <td className="p-2 text-muted-foreground" colSpan={canManage ? 6 : 5}>
                    Belum ada data pemantauan ibu hamil.
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
