import type { Metadata } from "next";

import { PendapatPublikForm } from "@/features/pendapat/presentation/components/pendapat-publik-form";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";
import { ThemeCard, ThemePageHeader } from "@/themes/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Jajak Pendapat",
  description: "Sampaikan pendapat atas pelayanan desa.",
};

export default async function PendapatPublikPage() {
  const { desa } = await siapkanTema();

  return (
    <div className="space-y-6">
      <ThemePageHeader
        title="Jajak Pendapat"
        description={`Sampaikan penilaian atas pelayanan ${desa.namaDesa ?? "desa"}.`}
        eyebrow="Partisipasi"
      />
      <ThemeCard className="max-w-2xl p-6">
        <PendapatPublikForm />
      </ThemeCard>
    </div>
  );
}
