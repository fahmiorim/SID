import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Analisis" };

export default function AnalisisPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Analisis" description="Master kategori dan indikator analisis" />
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Modul analisis tersedia.</p>
        </CardContent>
      </Card>
    </div>
  );
}
