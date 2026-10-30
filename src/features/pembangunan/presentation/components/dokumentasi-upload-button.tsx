"use client";

import { Upload } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { DokumentasiUploadDialog } from "./dokumentasi-upload-dialog";

/** Tombol "Unggah Foto" beserta dialognya. */
export function DokumentasiUploadButton({ proyekId }: { proyekId: number }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Upload className="size-4" />
        Unggah Foto
      </Button>

      <DokumentasiUploadDialog open={open} onOpenChange={setOpen} proyekId={proyekId} />
    </>
  );
}
