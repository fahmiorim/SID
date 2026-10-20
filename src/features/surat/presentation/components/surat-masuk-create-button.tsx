"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { KlasifikasiSuratDTO } from "@/features/surat/domain/surat";

import { SuratMasukFormDialog } from "./surat-masuk-form-dialog";

export function SuratMasukCreateButton({
  classifications,
}: {
  classifications: KlasifikasiSuratDTO[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Catat Surat Masuk
      </Button>

      <SuratMasukFormDialog open={open} onOpenChange={setOpen} classifications={classifications} />
    </>
  );
}
