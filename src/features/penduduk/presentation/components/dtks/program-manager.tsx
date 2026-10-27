"use client";

import { Loader2, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { hapusProgramDtksAction, simpanProgramDtksAction } from "../../actions-dtks-berkas";

/** Program bansos yang dikirim dari server. */
export interface ProgramView {
  id: number;
  kodeProgram: string;
  namaProgram: string;
  aktif: boolean;
}

interface ProgramManagerProps {
  program: ProgramView[];
  canManage: boolean;
}

/**
 * Pengaturan program bansos DTKS.
 *
 * Kode program unik per desa, jadi menyimpan dengan kode yang sama berarti
 * memperbarui program tersebut (lihat `upsertPengaturanProgram`).
 */
export function ProgramManager({ program, canManage }: ProgramManagerProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [hapusId, setHapusId] = useState<number | null>(null);
  const [galat, setGalat] = useState<string | null>(null);

  async function simpan(formData: FormData) {
    setPending(true);
    setGalat(null);

    const hasil = await simpanProgramDtksAction(formData);

    setPending(false);
    if (!hasil.ok) {
      setGalat(hasil.message);
      return;
    }

    toast.success(hasil.message);
    router.refresh();
  }

  async function hapus(id: number) {
    setHapusId(id);
    const hasil = await hapusProgramDtksAction(id);
    setHapusId(null);

    if (!hasil.ok) {
      toast.error(hasil.message);
      return;
    }

    toast.success(hasil.message);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {canManage ? (
        <form action={simpan} className="space-y-3 rounded-lg border p-4">
          <p className="text-sm font-medium">Tambah atau perbarui program</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="kode-program">Kode program</Label>
              <Input
                id="kode-program"
                name="kodeProgram"
                placeholder="PKH"
                required
                maxLength={50}
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nama-program">Nama program</Label>
              <Input
                id="nama-program"
                name="namaProgram"
                placeholder="Program Keluarga Harapan"
                required
                maxLength={200}
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aktif-program">Status</Label>
              <select
                id="aktif-program"
                name="aktif"
                defaultValue="1"
                disabled={pending}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
              >
                <option value="1">Aktif</option>
                <option value="0">Nonaktif</option>
              </select>
            </div>
          </div>

          {galat ? (
            <Alert variant="destructive">
              <AlertDescription>{galat}</AlertDescription>
            </Alert>
          ) : null}

          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <Save className="size-4" />}
            Simpan
          </Button>
        </form>
      ) : null}

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-40">Kode</TableHead>
              <TableHead>Nama Program</TableHead>
              <TableHead className="w-28">Status</TableHead>
              {canManage ? <TableHead className="w-16 text-right">Aksi</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {program.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManage ? 4 : 3} className="h-24 text-center text-sm">
                  Belum ada program bansos yang dikonfigurasi.
                </TableCell>
              </TableRow>
            ) : (
              program.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium tabular-nums">{item.kodeProgram}</TableCell>
                  <TableCell>{item.namaProgram}</TableCell>
                  <TableCell>
                    <Badge variant={item.aktif ? "secondary" : "outline"}>
                      {item.aktif ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  {canManage ? (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Hapus program ${item.namaProgram}`}
                        disabled={hapusId === item.id}
                        onClick={() => hapus(item.id)}
                      >
                        {hapusId === item.id ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
