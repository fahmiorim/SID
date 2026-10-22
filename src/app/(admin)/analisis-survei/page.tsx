import type { Metadata } from "next";

export const metadata: Metadata = { title: "Analisis & Survei" };

// TODO(Fase 2G): ganti placeholder ini dengan UI analisis/survei yang memakai
// skema survey_* dan action yang sudah ada. Lihat docs/RENCANA-PERBAIKAN.md.
export default function AnalisisSurveiPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analisis & Survei</h1>
        <p className="text-muted-foreground">Modul ini belum diimplementasikan.</p>
      </div>
      <div className="rounded-lg border p-6 text-center text-muted-foreground">
        Skema dan action dasar sudah ada, tetapi UI belum tersedia. Lihat docs/RENCANA-PERBAIKAN.md
        (Fase 2G).
      </div>
    </div>
  );
}
