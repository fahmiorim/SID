import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Pemilihan Desa" };

export default function PemilihanPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Pemilihan Desa" description="Data pemilihan, pemilih, calon, dan hasil" />
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Modul pemilihan desa tersedia.</p>
        </CardContent>
      </Card>
    </div>
  );
}
