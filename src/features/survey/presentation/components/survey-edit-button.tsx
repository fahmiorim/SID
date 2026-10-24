"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { SurveyRow } from "@/features/survey/domain/survey";

import { SurveyFormDialog } from "./survey-form-dialog";

export function SurveyEditButton({ survey }: { survey: SurveyRow }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="size-4" />
        Ubah Survei
      </Button>

      <SurveyFormDialog open={open} onOpenChange={setOpen} survey={survey} />
    </>
  );
}
