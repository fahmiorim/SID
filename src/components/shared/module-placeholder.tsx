import { Construction } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Layar placeholder untuk modul yang masih dibangun. */
export function ModulePlaceholder({ title, description }: { title: string; description?: string }) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />

      <Card>
        <CardHeader className="items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-full border border-border">
            <Construction className="size-5 text-muted-foreground" />
          </div>
          <CardTitle className="text-base">Modul dalam tahap pembangunan</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTitle>Terima kasih atas kesabaran Anda</AlertTitle>
            <AlertDescription>
              Modul ini akan segera terintegrasi dengan arsitektur bersih yang telah disiapkan.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
