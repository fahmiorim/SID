import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { PendapatPublikForm } from "@/features/pendapat/presentation/components/pendapat-publik-form";

export const dynamic = "force-dynamic";

export default async function PendapatPublikPage() {
  const desa = await getIdentitasFromRequest();

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Pendapat Warga</h1>
        <p className="text-muted-foreground">Jajak pendapat kepuasan pelayanan {desa.namaDesa}</p>
      </header>
      <PendapatPublikForm />
    </main>
  );
}
