"use client";

import { FileUp, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Textarea } from "@/components/ui/textarea";

import { hapusLampiranDtksAction, unggahLampiranDtksAction } from "../../actions-dtks-berkas";

/** Lampiran yang dikirim dari server (tanggal sudah diformat). */
export interface LampiranView {
  id: number;
  nama: string;
  berkas: string;
  keterangan: string | null;
  dibuat: string;
  url: string;
}

interface LampiranManagerProps {
  lampiran: LampiranView[];
  canManage: boolean;
}

/** Unggah & kelola lampiran/bukti pendukung DTKS. */
export function LampiranManager({ lampiran, canManage }: LampiranManagerProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [hapusId, setHapusId] = useState<number | null>(null);
  const [galat, setGalat] = useState<string | null>(null);

  async function unggah(formData: FormData) {
    setPending(true);
    setGalat(null);

    const hasil = await unggahLampiranDtksAction(formData);

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
    const hasil = await hapusLampiranDtksAction(id);
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
        <form action={unggah} className="space-y-3 rounded-lg border p-4">
          <p className="text-sm font-medium">Unggah lampiran baru</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nama-lampiran">Nama lampiran</Label>
              <Input id="nama-lampiran" name="nama" required maxLength={200} disabled={pending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="berkas-lampiran">Berkas</Label>
              <Input
                id="berkas-lampiran"
                name="berkas"
                type="file"
                accept="image/*,application/pdf"
                required
                disabled={pending}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="keterangan-lampiran">Keterangan</Label>
            <Textarea
              id="keterangan-lampiran"
              name="keterangan"
              rows={2}
              maxLength={500}
              disabled={pending}
            />
          </div>

          {galat ? (
            <Alert variant="destructive">
              <AlertDescription>{galat}</AlertDescription>
            </Alert>
          ) : null}

          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <FileUp className="size-4" />}
            Unggah
          </Button>
        </form>
      ) : null}

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead className="w-48">Berkas</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead className="w-40">Diunggah</TableHead>
              {canManage ? <TableHead className="w-16 text-right">Aksi</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {lampiran.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManage ? 5 : 4} className="h-24 text-center text-sm">
                  Belum ada lampiran DTKS.
                </TableCell>
              </TableRow>
            ) : (
              lampiran.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nama}</TableCell>
                  <TableCell>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline underline-offset-2"
                    >
                      Lihat berkas
                    </a>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.keterangan ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums">{item.dibuat}</TableCell>
                  {canManage ? (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Hapus lampiran ${item.nama}`}
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
