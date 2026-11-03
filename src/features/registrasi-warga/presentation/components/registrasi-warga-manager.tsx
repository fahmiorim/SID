"use client";

import { Check, Loader2, X } from "lucide-react";
import { startTransition, useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { KredensialWarga } from "@/features/warga/domain/warga";
import { createIdleActionState } from "@/lib/action-state";

import {
  LABEL_STATUS_REGISTRASI,
  type RegistrasiWargaDTO,
  type StatusRegistrasi,
} from "../../domain/registrasi-warga";
import {
  setujuiRegistrasiWargaAction,
  tolakRegistrasiWargaAction,
} from "../registrasi-warga-actions";

function statusLabel(status: string) {
  return LABEL_STATUS_REGISTRASI[status as StatusRegistrasi] ?? status;
}

function TolakRegistrasiButton({ id }: { id: number }) {
  const [state, formAction, isPending] = useActionState(
    tolakRegistrasiWargaAction,
    createIdleActionState<{ id: number } | null>(),
  );

  useEffect(() => {
    if (state.status === "success") toast.success(state.message);
    if (state.status === "error") toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="ghost" size="sm" disabled={isPending} aria-label="Tolak">
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
      </Button>
    </form>
  );
}

export function RegistrasiWargaManager({
  items,
  canApprove,
}: {
  items: RegistrasiWargaDTO[];
  canApprove: boolean;
}) {
  const [state, formAction, isPending] = useActionState(
    setujuiRegistrasiWargaAction,
    createIdleActionState<KredensialWarga | null>(),
  );
  const [kredensial, setKredensial] = useState<KredensialWarga | null>(null);

  useEffect(() => {
    if (state.status === "success") {
      startTransition(() => {
        setKredensial(state.data);
      });
      toast.success(state.message);
    }
    if (state.status === "error") toast.error(state.message);
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permohonan Akun Layanan Mandiri</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada permohonan akun warga.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full caption-bottom">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">NIK</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">Nama</th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                    No. HP
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                    Diajukan
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  {canApprove ? (
                    <th className="p-3 text-right text-sm font-medium text-muted-foreground">
                      Aksi
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const menunggu = item.status === "menunggu";
                  return (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="p-3 font-mono text-sm">{item.nik}</td>
                      <td className="p-3 font-medium">{item.nama}</td>
                      <td className="p-3 text-sm text-muted-foreground">{item.noHp || "—"}</td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString("id-ID")}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            item.status === "disetujui"
                              ? "default"
                              : item.status === "ditolak"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {statusLabel(item.status)}
                        </Badge>
                      </td>
                      {canApprove ? (
                        <td className="p-3">
                          {menunggu ? (
                            <div className="flex justify-end gap-1">
                              <form action={formAction}>
                                <input type="hidden" name="id" value={item.id} />
                                <Button
                                  type="submit"
                                  variant="ghost"
                                  size="sm"
                                  disabled={isPending}
                                  aria-label={`Setujui permohonan ${item.nama}`}
                                >
                                  {isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Check className="h-4 w-4" />
                                  )}
                                </Button>
                              </form>
                              <TolakRegistrasiButton id={item.id} />
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      <Dialog open={Boolean(kredensial)} onOpenChange={(open) => !open && setKredensial(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Akun warga dibuat</DialogTitle>
            <DialogDescription>
              Serahkan kredensial ini kepada warga. PIN hanya ditampilkan sekali dan wajib diganti
              saat login pertama.
            </DialogDescription>
          </DialogHeader>

          {kredensial ? (
            <dl className="space-y-2 rounded-md border p-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Nama pengguna (NIK)</dt>
                <dd className="font-mono font-medium">{kredensial.username}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">PIN sementara</dt>
                <dd className="font-mono font-medium">{kredensial.pin}</dd>
              </div>
            </dl>
          ) : null}

          <DialogFooter>
            <Button type="button" onClick={() => setKredensial(null)}>
              Selesai
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
