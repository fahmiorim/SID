export const dynamic = "force-dynamic";

export const metadata = { title: "Berita Desa" };

/**
 * Daftar berita desa.
 *
 * Skema konten (`berita`, `berita_kategori`) dan CMS-nya dibangun pada Fase 1C
 * dan 1F; halaman ini disiapkan lebih dulu agar menu publik tidak menuju 404.
 */
export default function BeritaPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Berita Desa</h1>
        <p className="text-muted-foreground">Kabar terbaru, pengumuman, dan kegiatan desa.</p>
      </header>
      <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        Belum ada berita yang dipublikasikan.
      </p>
    </div>
  );
}
