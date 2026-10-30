"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { deletePendapatAction } from "@/features/pendapat/presentation/actions-pendapat";

/**
 * Tombol hapus satu pendapat warga (admin), dengan umpan balik toast.
 *
 * Hanya dipakai oleh halaman admin; publik tidak punya aksi hapus.
 */
export function PendapatRowActions({ id, disabled }: { id: number; disabled?: boolean }) {
  async function handleDelete() {
    const res = await deletePendapatAction(id);
    if (res.ok) {
      toast.success("Pendapat dihapus.");
    } else {
      toast.error(res.message);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={disabled}
      onClick={handleDelete}
      aria-label="Hapus pendapat"
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
