"use client";

import { Loader2 } from "lucide-react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createIdleActionState } from "@/lib/action-state";

import { JENIS_IZIN_LABELS, STATUS_IZIN_LABELS, type IzinDTO } from "../../domain/izin";
import { putuskanIzinAction, simpanPengaturanKehadiranAction } from "../izin-actions";

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

function KeputusanForm({ item }: { item: IzinDTO }) {
  const [state, formAction, isPending] = useActionState(
    putuskanIzinAction,
    createIdleActionState<null>(),
  );

  useEffect(() => {
    if (state.status === "success") toast.success(state.message);
    else if (state.status === "error") toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="id" value={item.id} />
      <div className="min-w-48 flex-1">
        <Label htmlFor={`catatan-${item.id}`} className="text-xs">
          Catatan (opsional)
        </Label>
        <Input id={`catatan-${item.id}`} name="catatan" maxLength={500} />
      </div>
      <Button type="submit" size="sm" name="status" value="disetujui" disabled={isPending}>
        Setujui
      </Button>
      <Button
        type="submit"
        size="sm"
        variant="destructive"
        name="status"
        value="ditolak"
        disabled={isPending}
      >
        {isPending ? <Loader2 className="size-4 animate-spin" /> : "Tolak"}
      </Button>
    </form>
  );
}

export function IzinAdminPanel({
  items,
  rekap,
  pengaturan,
}: {
  items: IzinDTO[];
  rekap: {
    menunggu: number;
    disetujui: number;
    ditolak: number;
    berdasarkanJenis: { izin: number; sakit: number; cuti: number };
  };
  pengaturan: { jamMasuk: string; jamKeluar: string; hariLibur: number[] };
}) {
  const [state, formAction, isPending] = useActionState(
    simpanPengaturanKehadiranAction,
    createIdleActionState<null>(),
  );

  useEffect(() => {
    if (state.status === "success") toast.success(state.message);
    else if (state.status === "error") toast.error(state.message);
  }, [state]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ["Menunggu", rekap.menunggu],
          ["Disetujui", rekap.disetujui],
          ["Ditolak", rekap.ditolak],
          [
            "Izin/Sakit/Cuti",
            `${rekap.berdasarkanJenis.izin}/${rekap.berdasarkanJenis.sakit}/${rekap.berdasarkanJenis.cuti}`,
          ],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardContent className="py-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xl font-semibold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Jam kerja & hari libur</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-2">
                <Label htmlFor="jamMasuk">Jam masuk</Label>
                <Input
                  id="jamMasuk"
                  name="jamMasuk"
                  type="time"
                  defaultValue={pengaturan.jamMasuk}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jamKeluar">Jam keluar</Label>
                <Input
                  id="jamKeluar"
                  name="jamKeluar"
                  type="time"
                  defaultValue={pengaturan.jamKeluar}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Hari libur</p>
              <div className="flex flex-wrap gap-3">
                {HARI.map((nama, index) => (
                  <label key={nama} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="hariLibur"
                      value={index}
                      defaultChecked={pengaturan.hariLibur.includes(index)}
                    />
                    {nama}
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Simpan pengaturan
            </Button>
          </form>
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          Belum ada pengajuan izin pada periode ini.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="space-y-2 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="flex flex-wrap items-center gap-2 font-medium">
                      {item.namaPemohon ?? "Warga"}
                      <Badge variant="outline">{JENIS_IZIN_LABELS[item.jenis]}</Badge>
                      <Badge variant={item.status === "menunggu" ? "secondary" : "default"}>
                        {STATUS_IZIN_LABELS[item.status]}
                      </Badge>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.nikPemohon ?? "—"} · {item.tanggalMulai} s.d. {item.tanggalSelesai}
                    </p>
                  </div>
                </div>
                <p className="text-sm">{item.alasan}</p>
                {item.catatanOperator ? (
                  <p className="text-sm text-muted-foreground">Catatan: {item.catatanOperator}</p>
                ) : null}
                {item.status === "menunggu" ? <KeputusanForm item={item} /> : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
