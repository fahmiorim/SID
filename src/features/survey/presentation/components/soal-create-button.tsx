"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { SoalFormDialog } from "./soal-form-dialog";

export function SoalCreateButton({
  surveyId,
  urutanAwal,
}: {
  surveyId: number;
  urutanAwal: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Tambah Pertanyaan
      </Button>

      <SoalFormDialog
        open={open}
        onOpenChange={setOpen}
        surveyId={surveyId}
        urutanAwal={urutanAwal}
      />
    </>
  );
}
