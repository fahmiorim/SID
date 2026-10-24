"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { SoalRow } from "@/features/survey/domain/survey";

import { RespondenFormDialog } from "./responden-form-dialog";

export function RespondenCreateButton({ surveyId, soal }: { surveyId: number; soal: SoalRow[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        disabled={soal.length === 0}
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4" />
        Tambah Responden
      </Button>

      <RespondenFormDialog open={open} onOpenChange={setOpen} surveyId={surveyId} soal={soal} />
    </>
  );
}
