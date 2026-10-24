"use client";

import { Eye } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { PermohonanAdminRow } from "@/features/layanan-mandiri/domain/layanan-mandiri";
import { PermohonanDetailDialog } from "@/features/layanan-mandiri/presentation/components/permohonan-detail-dialog";

/** Tombol buka dialog periksa permohonan pada tabel operator. */
export function PermohonanDetailButton({ permohonan }: { permohonan: PermohonanAdminRow }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Eye className="size-4" />
        Periksa
      </Button>
      <PermohonanDetailDialog permohonan={permohonan} open={open} onOpenChange={setOpen} />
    </>
  );
}
