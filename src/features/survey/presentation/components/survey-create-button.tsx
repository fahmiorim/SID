"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { SurveyFormDialog } from "./survey-form-dialog";

export function SurveyCreateButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Buat Survei
      </Button>

      <SurveyFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
