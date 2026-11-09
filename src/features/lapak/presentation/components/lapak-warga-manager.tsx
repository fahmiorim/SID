"use client";

import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createIdleActionState } from "@/lib/action-state";

import type { LapakDTO } from "../../domain/lapak";
import {
  hapusLapakWargaAction,
  tambahLapakWargaAction,
  ubahLapakWargaAction,
} from "../lapak-warga-actions";

function LapakForm({ item, onSelesai }: { item: LapakDTO | null; onSelesai: () => void }) {
  const [state, formAction, isPending] = useActionState(
    item ? ubahLapakWargaAction : tambahLapakWargaAction,
    createIdleActionState<{ id: number } | null>(),
  );
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      onSelesai();
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state, onSelesai]);

  return (
    <form action={formAction} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
      {item ? <input type="hidden" name="id" value={item.id} /> : null}

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`nama-${item?.id ?? "baru"}`}>Nama usaha</Label>
        <Input
          id={`nama-${item?.id ?? "baru"}`}
          name="nama"
          defaultValue={item?.nama ?? ""}
          maxLength={200}
          required
        />
        {fieldErrors?.nama?.map((message) => (
          <p key={message} className="text-xs text-destructive">
            {message}
          </p>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`kategori-${item?.id ?? "baru"}`}>Kategori</Label>
        <Input
          id={`kategori-${item?.id ?? "baru"}`}
          name="kategori"
          defaultValue={item?.kategori ?? ""}
          maxLength={100}
          placeholder="Mis. Makanan, Jasa"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`alamat-${item?.id ?? "baru"}`}>Alamat</Label>
        <Input
          id={`alamat-${item?.id ?? "baru"}`}
          name="alamat"
          defaultValue={item?.alamat ?? ""}
          maxLength={500}
        />
      </div>

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`keterangan-${item?.id ?? "baru"}`}>Keterangan</Label>
        <Textarea
          id={`keterangan-${item?.id ?? "baru"}`}
          name="keterangan"
          defaultValue={item?.keterangan ?? ""}
          maxLength={1000}
          rows={3}
        />
      </div>

      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          {item ? "Simpan perubahan" : "Tambah lapak"}
        </Button>
        {item ? (
          <Button type="button" size="sm" variant="outline" onClick={onSelesai}>
            Batal
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function HapusLapakButton({
  item,
  formAction,
  disabled,
}: {
  item: LapakDTO;
  formAction: (formData: FormData) => void;
  disabled: boolean;
}) {
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={item.id} />
      <Button
        type="submit"
        size="sm"
        variant="ghost"
        disabled={disabled}
        aria-label={`Hapus ${item.nama}`}
        onClick={(event) => {
          if (!window.confirm(`Hapus lapak “${item.nama}”?`)) event.preventDefault();
        }}
      >
        <Trash2 className="size-4" />
      </Button>
    </form>
  );
}

export function LapakWargaManager({ items }: { items: LapakDTO[] }) {
  const [tambah, setTambah] = useState(false);
  const [diubah, setDiubah] = useState<LapakDTO | null>(null);

  // Status hapus dikelola di sini, bukan di dalam tombol baris. Setelah
  // `revalidatePath` baris yang dihapus ikut unmount, sehingga efek toast di
  // tombol tidak pernah sempat berjalan dan warga tidak melihat konfirmasi.
  const [hapusState, hapusAction, hapusPending] = useActionState(
    hapusLapakWargaAction,
    createIdleActionState<null>(),
  );

  useEffect(() => {
    if (hapusState.status === "success") toast.success(hapusState.message);
    else if (hapusState.status === "error") toast.error(hapusState.message);
  }, [hapusState]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Lapak yang Anda tambahkan langsung tampil di katalog publik desa.
        </p>
        <Button size="sm" onClick={() => setTambah(true)} disabled={tambah}>
          <Plus className="mr-1 size-4" />
          Tambah lapak
        </Button>
      </div>

      {tambah ? <LapakForm item={null} onSelesai={() => setTambah(false)} /> : null}

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Belum ada lapak. Tambahkan usaha Anda agar warga lain dapat menemukannya.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {items.map((item) => (
            <li key={item.id} className="space-y-2 p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="flex flex-wrap items-center gap-2 font-medium">
                    {item.nama}
                    {item.kategori ? <Badge variant="outline">{item.kategori}</Badge> : null}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.alamat || "Alamat belum diisi"}
                  </p>
                  {item.keterangan ? (
                    <p className="text-sm text-muted-foreground">{item.keterangan}</p>
                  ) : null}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`Ubah ${item.nama}`}
                    onClick={() => setDiubah(diubah?.id === item.id ? null : item)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <HapusLapakButton item={item} formAction={hapusAction} disabled={hapusPending} />
                </div>
              </div>
              {diubah?.id === item.id ? (
                <LapakForm item={item} onSelesai={() => setDiubah(null)} />
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
