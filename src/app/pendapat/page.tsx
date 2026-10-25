import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { JAWABAN_KEPUASAN } from "@/features/pendapat/domain/pendapat";
import { submitPendapatPublikAction } from "@/features/pendapat/presentation/actions-pendapat";

export const dynamic = "force-dynamic";

export default async function PendapatPublikPage() {
  const desa = await getIdentitasFromRequest();

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Pendapat Warga</h1>
        <p className="text-muted-foreground">Jajak pendapat kepuasan pelayanan {desa.namaDesa}</p>
      </header>
      <form action={submitPendapatPublikAction} className="space-y-4 rounded-md border p-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nama (opsional)</label>
          <input
            name="pengguna"
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Nama atau inisial"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Penilaian pelayanan</label>
          <div className="space-y-2">
            {JAWABAN_KEPUASAN.map((j) => (
              <label key={j.value} className="flex items-center gap-2 text-sm">
                <input type="radio" name="pilihan" value={j.value} required />
                {j.label}
              </label>
            ))}
          </div>
        </div>
        <button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
          Kirim Pendapat
        </button>
      </form>
    </main>
  );
}
