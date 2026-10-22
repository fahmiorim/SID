"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { SyaratSuratDTO } from "@/features/surat/domain/isian";
import type { KlasifikasiSuratDTO } from "@/features/surat/domain/surat";

import { JenisSuratFormDialog } from "./jenis-surat-form-dialog";

export function JenisSuratCreateButton({
  classifications,
  syarat,
}: {
  classifications: KlasifikasiSuratDTO[];
  syarat: SyaratSuratDTO[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Tambah Jenis Surat
      </Button>

      <JenisSuratFormDialog
        open={open}
        onOpenChange={setOpen}
        classifications={classifications}
        syarat={syarat}
      />
    </>
  );
}
