"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { KlasifikasiSuratDTO } from "@/features/surat/domain/surat";

import { SuratKeluarFormDialog } from "./surat-keluar-form-dialog";

export function SuratKeluarCreateButton({
  classifications,
}: {
  classifications: KlasifikasiSuratDTO[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Catat Surat Keluar
      </Button>

      <SuratKeluarFormDialog open={open} onOpenChange={setOpen} classifications={classifications} />
    </>
  );
}
