import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { daftarDokumenAdmin } from "@/features/konten/application/dokumen-use-cases";

import { DokumenForm } from "./DokumenForm";

export const metadata = { title: "Dokumen Desa" };

export default async function DokumenPage() {
  const dokumen = await daftarDokumenAdmin();

  return (
    <div className="space-y-6">
      <PageHeader title="Dokumen Desa" description="Inventaris dan publikasi dokumen" />
      <Card>
        <CardContent className="p-6">
          <DokumenForm dokumenList={dokumen} />
        </CardContent>
      </Card>
    </div>
  );
}
