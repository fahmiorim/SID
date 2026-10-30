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
import { STATUS_GIZI_ANAK, STATUS_TIKAR_ANAK } from "@/features/kesehatan/domain/kesehatan";
import {
  deleteBulananAnakAction,
  saveBulananAnakAction,
} from "@/features/kesehatan/presentation/actions-bulanan-anak";

export interface BulananAnakRow {
  id: number;
  posyanduId: number;
  kiaId: number;
  statusGizi: number;
  umurBulan: number;
  statusTikar: number;
  pemberianImunisasiDasar: boolean;
  pemberianImunisasiCampak: boolean | null;
  pengukuranBeratBadan: boolean;
  beratBadan: number | string | null;
  pengukuranTinggiBadan: boolean;
  tinggiBadan: number | string | null;
  konselingGiziAyah: boolean;
  konselingGiziIbu: boolean;
  kunjunganRumah: boolean;
  airBersih: boolean;
  kepemilikanJamban: boolean;
  aktaLahir: boolean;
  jaminanKesehatan: boolean;
  pengasuhanPaud: boolean;
}

interface Option {
  id: number;
  label: string;
}

const CHECKS = [
  ["pemberianImunisasiDasar", "Imunisasi dasar"],
  ["pemberianImunisasiCampak", "Imunisasi campak"],
  ["pengukuranBeratBadan", "Pengukuran berat badan"],
  ["pengukuranTinggiBadan", "Pengukuran tinggi badan"],
  ["konselingGiziAyah", "Konseling gizi ayah"],
  ["konselingGiziIbu", "Konseling gizi ibu"],
  ["kunjunganRumah", "Kunjungan rumah"],
  ["airBersih", "Akses air bersih"],
  ["kepemilikanJamban", "Kepemilikan jamban"],
  ["aktaLahir", "Akta lahir"],
  ["jaminanKesehatan", "Jaminan kesehatan"],
  ["pengasuhanPaud", "Pengasuhan PAUD"],
] as const satisfies readonly (readonly [keyof BulananAnakRow, string])[];

function BulananAnakDialog({
  row,
  posyanduOptions,
  kiaOptions,
  trigger,
}: {
  row?: BulananAnakRow;
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
          <DialogTitle>{row ? "Ubah Pemantauan Anak" : "Tambah Pemantauan Anak"}</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            const res = await saveBulananAnakAction(formData);
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
              <label className="text-sm font-medium">Umur (bulan)</label>
              <Input
                type="number"
                min={0}
                max={60}
                name="umurBulan"
                required
                defaultValue={row?.umurBulan ?? ""}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status Gizi</label>
              <Select
                name="statusGizi"
                defaultValue={row ? String(row.statusGizi) : undefined}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status gizi" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_GIZI_ANAK.map((status) => (
                    <SelectItem key={status.value} value={String(status.value)}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status Tikar</label>
              <Select
                name="statusTikar"
                defaultValue={row ? String(row.statusTikar) : undefined}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status tikar" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_TIKAR_ANAK.map((status) => (
                    <SelectItem key={status.value} value={String(status.value)}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Berat Badan (kg)</label>
              <Input
                type="number"
                step="0.1"
                min={0}
                name="beratBadan"
                defaultValue={row?.beratBadan ?? ""}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tinggi Badan (cm)</label>
              <Input
                type="number"
                step="0.1"
                min={0}
                name="tinggiBadan"
                defaultValue={row?.tinggiBadan ?? ""}
              />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {CHECKS.map(([name, label]) => (
              <label key={name} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name={name}
                  defaultChecked={Boolean(row?.[name])}
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

export function BulananAnakTable({
  rows,
  posyanduOptions,
  kiaOptions,
  canManage,
}: {
  rows: BulananAnakRow[];
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
          <BulananAnakDialog
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
          <Link href="/kesehatan/pemantauan-anak/ekspor">
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
                <th className="p-2 text-left">Umur</th>
                <th className="p-2 text-left">Status Gizi</th>
                <th className="p-2 text-left">Status Tikar</th>
                {canManage && <th className="p-2 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id} className="border-b">
                  <td className="p-2">{label(kiaOptions, row.kiaId)}</td>
                  <td className="p-2">{label(posyanduOptions, row.posyanduId)}</td>
                  <td className="p-2">{row.umurBulan} bln</td>
                  <td className="p-2">
                    {STATUS_GIZI_ANAK.find((status) => status.value === row.statusGizi)?.label ??
                      "-"}
                  </td>
                  <td className="p-2">
                    {STATUS_TIKAR_ANAK.find((status) => status.value === row.statusTikar)?.label ??
                      "-"}
                  </td>
                  {canManage && (
                    <td className="p-2">
                      <div className="flex justify-end gap-1">
                        <BulananAnakDialog
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
                            const res = await deleteBulananAnakAction(row.id);
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
                    Belum ada data pemantauan anak.
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
