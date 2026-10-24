"use client";

import { Eye } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { PermohonanAdminRow } from "@/features/layanan-mandiri/domain/layanan-mandiri";
import { PermohonanDetailDialog } from "@/features/layanan-mandiri/presentation/components/permohonan-detail-dialog";

/**
 * Tombol buka dialog periksa permohonan pada tabel operator.
 *
 * `canManage` diteruskan ke dialog: peran `read` (sekdes/kades) tetap bisa
 * melihat detail, tetapi tanpa tombol proses/kembalikan/batalkan.
 */
export function PermohonanDetailButton({
  permohonan,
  canManage,
}: {
  permohonan: PermohonanAdminRow;
  canManage: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Eye className="size-4" />
        Periksa
      </Button>
      <PermohonanDetailDialog
        permohonan={permohonan}
        canManage={canManage}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
