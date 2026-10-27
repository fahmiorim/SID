"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { removeSuplemenTerdataAction } from "@/features/penduduk/presentation/actions-suplemen";

interface SuplemenTerdataRowActionsProps {
  terdataId: number;
  label: string;
  /** Hanya pemegang izin `delete` yang boleh melihat tombol hapus. */
  canDelete: boolean;
}

/** Tombol hapus satu baris terdata pada halaman detail suplemen. */
export function SuplemenTerdataRowActions({
  terdataId,
  label,
  canDelete,
}: SuplemenTerdataRowActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  if (!canDelete) return null;

  async function hapus() {
    if (!confirm(`Hapus terdata "${label}" dari suplemen ini?`)) return;

    setPending(true);
    const hasil = await removeSuplemenTerdataAction(terdataId);
    setPending(false);

    if (!hasil.ok) {
      toast.error(hasil.message);
      return;
    }

    toast.success("Terdata dihapus.");
    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={`Hapus terdata ${label}`}
      className="text-destructive print:hidden"
      disabled={pending}
      onClick={hapus}
    >
      {pending ? <Loader2 className="animate-spin" /> : <Trash2 className="size-4" />}
    </Button>
  );
}
