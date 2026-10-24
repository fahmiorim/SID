"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { KlasifikasiSuratDTO } from "@/features/surat/domain/surat";

import { SuratDinasFormDialog } from "./surat-dinas-form-dialog";

export function SuratDinasCreateButton({
  classifications,
}: {
  classifications: KlasifikasiSuratDTO[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Catat Surat Dinas
      </Button>

      <SuratDinasFormDialog open={open} onOpenChange={setOpen} classifications={classifications} />
    </>
  );
}
