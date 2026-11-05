import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Tautan unduh template APBDes.
 *
 * Memakai tautan biasa (bukan `window.location`) agar tidak perlu JavaScript
 * dan tetap berfungsi saat halaman dicetak/di-pratinjau.
 */
export function ApbdesTemplateButton() {
  return (
    <Button variant="outline" asChild>
      <a href="/keuangan/anggaran/template" download>
        <Download className="mr-2 size-4" />
        Unduh Template
      </a>
    </Button>
  );
}
