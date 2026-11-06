"use client";

import {
  CheckCircle2,
  Globe,
  Loader2,
  MoreHorizontal,
  ShieldAlert,
  Shrink,
  Unlock,
} from "lucide-react";
import { useActionState, useEffect, useRef } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { idleActionState } from "@/lib/action-state";

import { type DesaSuperAdminRow } from "../../infrastructure/provisioning-repository";
import {
  resetAksesAdminAction,
  tambahDomainAction,
  ubahKuotaMediaAction,
  ubahStatusDesaAction,
} from "../kelola-desa-actions";

export function KelolaDesaToolbar({ desa }: { desa: DesaSuperAdminRow & { id: number } }) {
  const [_stateStatus, _actionStatus, pendingStatus] = useActionState(
    ubahStatusDesaAction,
    idleActionState,
  );
  void _stateStatus;
  const refreshRef = useRef<VoidFunction | null>(null);
  useEffect(() => {
    if (pendingStatus) return;
    refreshRef.current?.();
  }, [pendingStatus]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" title="Kelola desa">
          <MoreHorizontal className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-3 text-sm">
        <div className="space-y-3">
          <p className="font-semibold">{desa.name ?? `Desa #${desa.id}`}</p>
          <Separator />
          <KelolaForm desa={desa} refreshRef={refreshRef} />
        </div>
      </PopoverContent>
    </Popover>
  );
}

function KelolaForm({
  desa,
  refreshRef,
}: {
  desa: DesaSuperAdminRow & { id: number };
  refreshRef: React.MutableRefObject<VoidFunction | null>;
}) {
  const [stateStatus, actionStatus, pendingStatus] = useActionState(
    ubahStatusDesaAction,
    idleActionState,
  );
  const pesanStatus = stateStatus.status === "idle" ? null : stateStatus.message;
  const suksesStatus = stateStatus.status === "success";

  useEffect(() => {
    if (pendingStatus) return;
    refreshRef.current?.();
  }, [pendingStatus, refreshRef]);

  return (
    <>
      <form action={actionStatus} className="space-y-3">
        <input type="hidden" name="villageId" value={String(desa.id)} />
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Status</span>
          {desa.active ? (
            <Badge variant="outline" className="gap-1 bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="size-3" /> Aktif
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 bg-amber-50 text-amber-700">
              <ShieldAlert className="size-3" /> Diarsipkan
            </Badge>
          )}
        </div>
        <Button
          type="submit"
          name="active"
          value={String(!desa.active)}
          disabled={pendingStatus || stateStatus.status === "error"}
          variant={desa.active ? "destructive" : "default"}
          className="w-full justify-start gap-2"
        >
          {pendingStatus ? (
            <Loader2 className="size-3 animate-spin" />
          ) : desa.active ? (
            <Shrink className="size-3" />
          ) : (
            <Unlock className="size-3" />
          )}
          {desa.active ? "Arsipkan desa" : "Aktifkan desa"}
        </Button>
        {pesanStatus && !suksesStatus && <p className="text-xs text-destructive">{pesanStatus}</p>}
        {suksesStatus && <p className="text-xs text-emerald-600">{pesanStatus}</p>}
      </form>

      <Separator />
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full justify-start gap-2">
            <Globe className="size-3" />
            Ubah domain
          </Button>
        </DialogTrigger>
        <UbahDomainContent desa={desa} />
      </Dialog>

      <Separator />
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full justify-start gap-2">
            <ShieldAlert className="size-3" />
            Ubah kuota media
          </Button>
        </DialogTrigger>
        <UbahKuotaContent desa={desa} refreshRef={refreshRef} />
      </Dialog>

      <Separator />
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full justify-start gap-2">
            <Unlock className="size-3" />
            Reset akses admin
          </Button>
        </DialogTrigger>
        <ResetAdminContent desa={desa} refreshRef={refreshRef} />
      </Dialog>
    </>
  );
}

function UbahDomainContent({ desa }: { desa: DesaSuperAdminRow & { id: number } }) {
  const [stateTambah, tambahAction, tambahPending] = useActionState(
    tambahDomainAction,
    idleActionState,
  );

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Domain desa {desa.name ?? "#"}</DialogTitle>
        <DialogDescription>
          Domain utama digunakan subdomain publik (<code>{desa.domain ?? "belum dipetakan"}</code>).
          Alias memungkinkan desa diakses lewat host lain.
        </DialogDescription>
      </DialogHeader>
      <form action={tambahAction} className="space-y-3">
        <input type="hidden" name="villageId" value={String(desa.id)} />
        <div className="space-y-2">
          <Label htmlFor="domain">Tambah alias domain</Label>
          <Input id="domain" name="domain" placeholder="contoh.desa.id" required />
        </div>
        <Button type="submit" disabled={tambahPending}>
          {tambahPending && <Loader2 className="mr-2 size-3 animate-spin" />}
          Tambah domain
        </Button>
        {stateTambah.status === "success" && (
          <p className="text-xs text-emerald-600">{stateTambah.message}</p>
        )}
        {stateTambah.status === "error" && (
          <p className="text-xs text-destructive">{stateTambah.message}</p>
        )}
      </form>
      <Separator />
      <div className="space-y-2 text-xs text-muted-foreground">
        <p>Untuk menghapus domain utama, ganti dulu domain utamanya dengan alias lain.</p>
        <p>Pastikan record DNS / reverse proxy sudah mengarahkan host baru ke server.</p>
      </div>
    </DialogContent>
  );
}

function UbahKuotaContent({
  desa,
  refreshRef,
}: {
  desa: DesaSuperAdminRow & { id: number };
  refreshRef: React.MutableRefObject<VoidFunction | null>;
}) {
  const [state, action, pending] = useActionState(ubahKuotaMediaAction, idleActionState);
  const pesan = state.status === "idle" ? null : state.message;
  const sukses = state.status === "success";

  useEffect(() => {
    if (pending) return;
    refreshRef.current?.();
  }, [pending, refreshRef]);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Kuota media {desa.name ?? "#"}</DialogTitle>
        <DialogDescription>
          Kuota membatasi total penyimpanan media desa ini (gambar/dokumen). Kosongkan untuk tanpa
          batas.
        </DialogDescription>
      </DialogHeader>
      <form action={action} className="space-y-3">
        <input type="hidden" name="villageId" value={String(desa.id)} />
        <div className="space-y-2">
          <Label htmlFor="kuotaMediaMb">Kuota (MB)</Label>
          <Input id="kuotaMediaMb" name="kuotaMediaMb" placeholder="Kosong = tanpa batas" />
        </div>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="mr-2 size-3 animate-spin" />}
          Simpan kuota
        </Button>
        {!pending && !sukses && state.status === "error" && (
          <p className="text-xs text-destructive">{pesan}</p>
        )}
        {sukses && <p className="text-xs text-emerald-600">{pesan}</p>}
      </form>
    </DialogContent>
  );
}

function ResetAdminContent({
  desa,
  refreshRef,
}: {
  desa: DesaSuperAdminRow & { id: number };
  refreshRef: React.MutableRefObject<VoidFunction | null>;
}) {
  const [state, action, pending] = useActionState(resetAksesAdminAction, idleActionState);
  const sandi = state.status === "success" ? state.data?.sandiSementara : null;

  useEffect(() => {
    if (pending) return;
    refreshRef.current?.();
  }, [pending, refreshRef]);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Reset akses admin {desa.name ?? "#"}</DialogTitle>
        <DialogDescription>
          Sandi administrator desa di-reset satu kali. Tindakan ini akan langsung memblokir akses
          admin lama.
        </DialogDescription>
      </DialogHeader>
      {sandi && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">
          <p className="mb-1 font-medium text-amber-800">Sandi sementara baru:</p>
          <code className="font-mono text-base break-all text-amber-900">{sandi}</code>
          <p className="mt-2 text-xs text-amber-700">
            Sampaikan sandi ini ke administrator desa. Setelah masuk, sandi dapat diganti pada
            pengaturan akun.
          </p>
        </div>
      )}
      <form action={action} className="space-y-3">
        <input type="hidden" name="villageId" value={String(desa.id)} />
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Batal
            </Button>
          </DialogClose>
          <Button type="submit" disabled={pending} variant="destructive">
            {pending && <Loader2 className="mr-2 size-3 animate-spin" />}
            Reset akses admin
          </Button>
        </DialogFooter>
      </form>
      {state.status === "error" && <p className="text-xs text-destructive">{state.message}</p>}
    </DialogContent>
  );
}
