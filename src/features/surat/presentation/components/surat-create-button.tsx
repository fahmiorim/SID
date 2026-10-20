"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { JenisSuratDTO } from "@/features/surat/domain/surat";

import { SuratFormDialog } from "./surat-form-dialog";

interface PendudukOption {
  id: number;
  name: string;
  nationalId: string | null;
}

export function SuratCreateButton({
  jenis,
  penduduk,
}: {
  jenis: JenisSuratDTO[];
  penduduk: PendudukOption[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} disabled={jenis.length === 0}>
        <Plus className="size-4" />
        Buat Surat
      </Button>

      <SuratFormDialog open={open} onOpenChange={setOpen} jenis={jenis} penduduk={penduduk} />
    </>
  );
}
