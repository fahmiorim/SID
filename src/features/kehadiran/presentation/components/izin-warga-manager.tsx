"use client";

import { Loader2 } from "lucide-react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  JENIS_IZIN_LABELS,
  STATUS_IZIN_LABELS,
  type IzinDTO,
} from "@/features/kehadiran/domain/izin";
import { createIdleActionState } from "@/lib/action-state";

import { ajukanIzinWargaAction } from "../izin-actions";

function badgeVariant(status: IzinDTO["status"]) {
  if (status === "disetujui") return "default" as const;
  if (status === "ditolak") return "destructive" as const;
  return "secondary" as const;
}

export function IzinWargaManager({ items }: { items: IzinDTO[] }) {
  const [state, formAction, isPending] = useActionState(
    ajukanIzinWargaAction,
    createIdleActionState<{ id: number } | null>(),
  );
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;
  const sukses = state.status === "success";

  useEffect(() => {
    if (state.status === "success") toast.success(state.message);
    else if (state.status === "error") toast.error(state.message);
  }, [state]);

  return (
    <div className="space-y-6">
      <form action={formAction} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="jenis">Jenis</Label>
          <select
            id="jenis"
            name="jenis"
            defaultValue="izin"
            className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            {Object.entries(JENIS_IZIN_LABELS).map(([kode, label]) => (
              <option key={kode} value={kode}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tanggalMulai">Tanggal mulai</Label>
          <Input id="tanggalMulai" name="tanggalMulai" type="date" required />
          {fieldErrors?.tanggalMulai?.map((message) => (
            <p key={message} className="text-xs text-destructive">
              {message}
            </p>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tanggalSelesai">Tanggal selesai</Label>
          <Input id="tanggalSelesai" name="tanggalSelesai" type="date" required />
          {fieldErrors?.tanggalSelesai?.map((message) => (
            <p key={message} className="text-xs text-destructive">
              {message}
            </p>
          ))}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="alasan">Alasan</Label>
          <Textarea
            id="alasan"
            name="alasan"
            rows={3}
            maxLength={500}
            placeholder="Jelaskan alasan izin/sakit/cuti (minimal 10 karakter)."
            required
          />
          {fieldErrors?.alasan?.map((message) => (
            <p key={message} className="text-xs text-destructive">
              {message}
            </p>
          ))}
        </div>

        <div className="sm:col-span-2">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {sukses ? "Kirim pengajuan lain" : "Kirim pengajuan"}
          </Button>
        </div>
      </form>

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Belum ada pengajuan izin.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {items.map((item) => (
            <li key={item.id} className="space-y-1 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex flex-wrap items-center gap-2 font-medium">
                  {JENIS_IZIN_LABELS[item.jenis]}
                  <Badge variant={badgeVariant(item.status)}>
                    {STATUS_IZIN_LABELS[item.status]}
                  </Badge>
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.tanggalMulai} s.d. {item.tanggalSelesai}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">{item.alasan}</p>
              {item.catatanOperator ? (
                <p className="rounded-lg bg-muted p-2 text-sm">
                  Catatan operator: {item.catatanOperator}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
