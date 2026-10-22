export const dynamic = "force-dynamic";

export const metadata = { title: "Galeri Desa" };

/** Galeri foto/video desa. Skema & CMS dibangun pada Fase 1C/1F. */
export default function GaleriPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Galeri Desa</h1>
        <p className="text-muted-foreground">Dokumentasi kegiatan dan potret desa.</p>
      </header>
      <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        Belum ada album galeri.
      </p>
    </div>
  );
}
