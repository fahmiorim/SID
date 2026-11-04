"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ApbdesTemplateButton() {
  const handleDownload = () => {
    window.location.href = "/keuangan/anggaran/template";
  };

  return (
    <Button variant="outline" onClick={handleDownload}>
      <Download className="mr-2 size-4" />
      Unduh Template
    </Button>
  );
}
