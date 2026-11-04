"use client";

import { AlertCircle, Loader2, Settings, Trash2 } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { idleActionState } from "@/lib/action-state";

import type { KategoriLampiran, MediaSettingsEfektif } from "../../domain/pengaturan-berkas";
import { resetMediaSettingsActionWrapped, saveMediaSettings } from "../actions";

interface LampiranSettingsTableProps {
  settings: MediaSettingsEfektif[];
}

const KATEGORI_LABELS: Record<KategoriLampiran, string> = {
  surat: "Surat (Disposisi/Ekspedisi)",
  "surat-tte": "Surat TTE",
  dokumen: "Dokumen Desa",
  umum: "Umum",
  pengaduan: "Pengaduan",
  permohonan: "Permohonan Surat",
  berita: "Berita",
  galeri: "Galeri",
  slider: "Slider",
  perangkat: "Perangkat Desa",
};

function SettingsRow({
  setting,
  onReset,
}: {
  setting: MediaSettingsEfektif;
  onReset: (kategori: KategoriLampiran) => void;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(saveMediaSettings, idleActionState);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state]);

  const handleReset = async () => {
    const result = await resetMediaSettingsActionWrapped(setting.kategori);
    if (result.status === "success") {
      toast.success(result.message);
      onReset(setting.kategori);
    } else if (result.status === "error") {
      toast.error(result.message);
    }
  };

  const defaultMime = setting.mimeAllowlist.join(", ");
  const isOverridden = setting.overridden;

  return (
    <TableRow>
      <TableCell className="font-medium">
        {KATEGORI_LABELS[setting.kategori] ?? setting.kategori}
        {isOverridden && <span className="ml-2 text-xs text-muted-foreground">(disesuaikan)</span>}
      </TableCell>
      <TableCell className="max-w-xs truncate text-muted-foreground">
        {isOverridden ? setting.mimeAllowlist.join(", ") : defaultMime}
      </TableCell>
      <TableCell>{setting.maxFiles}</TableCell>
      <TableCell>{Math.round(setting.maxSizeBytes / 1024 / 1024)} MB</TableCell>
      <TableCell className="space-x-1">
        <Dialog open={isDialogOpen && state.status !== "success"} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="mr-1 size-4" />
              Atur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <form action={formAction}>
              <DialogHeader>
                <DialogTitle>Pengaturan: {KATEGORI_LABELS[setting.kategori]}</DialogTitle>
                <DialogDescription>
                  Kosongkan field untuk menggunakan nilai default.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <input type="hidden" name="kategori" value={setting.kategori} />

                <div className="space-y-2">
                  <Label htmlFor="mimeAllowlist">MIME Allowlist</Label>
                  <Textarea
                    id="mimeAllowlist"
                    name="mimeAllowlist"
                    placeholder="image/jpeg, image/png, application/pdf"
                    defaultValue={isOverridden ? setting.mimeAllowlist.join(", ") : ""}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Pisahkan dengan koma. Contoh: image/jpeg, image/png, application/pdf
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxFiles">Jumlah File Maksimal</Label>
                    <Input
                      id="maxFiles"
                      name="maxFiles"
                      type="number"
                      min={1}
                      max={100}
                      defaultValue={isOverridden ? String(setting.maxFiles) : ""}
                      placeholder="Default"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxSizeMb">Ukuran Maksimal per File (MB)</Label>
                    <Input
                      id="maxSizeMb"
                      name="maxSizeMb"
                      type="number"
                      min={0.1}
                      max={500}
                      step={0.1}
                      defaultValue={
                        isOverridden ? String(Math.round(setting.maxSizeBytes / 1024 / 1024)) : ""
                      }
                      placeholder="Default"
                    />
                  </div>
                </div>

                {state.status === "error" && state.fieldErrors === undefined ? (
                  <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertDescription>{state.message}</AlertDescription>
                  </Alert>
                ) : null}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Simpan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {isOverridden && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-1 size-4" />
            Reset
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}

export function LampiranSettingsTable({ settings }: LampiranSettingsTableProps) {
  const handleReset = (_kategori: KategoriLampiran) => {
    window.location.reload();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengaturan Lampiran per Kategori</CardTitle>
        <CardDescription>
          Konfigurasi MIME yang diizinkan, jumlah file maksimal, dan ukuran per file untuk setiap
          kategori.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kategori</TableHead>
              <TableHead>MIME Allowlist</TableHead>
              <TableHead>Max Files</TableHead>
              <TableHead>Max Ukuran</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {settings.map((setting) => (
              <SettingsRow key={setting.kategori} setting={setting} onReset={handleReset} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
