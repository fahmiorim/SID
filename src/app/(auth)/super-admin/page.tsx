import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Super-Admin - Multi-Desa",
  description: "Dashboard pengelolaan banyak desa untuk super-admin",
};

export default function SuperAdminDashboard() {
  return (
    <div className="min-h-screen bg-background p-6">
      <h1 className="mb-6 text-3xl font-bold">Super-Admin Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card: Daftar Desa */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-semibold mb-4">Daftar Desa</h2>
          <p className="text-muted-foreground">
            1 desa terdaftar saat ini. Gunakan wizard di bawah untuk menambah desa baru.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="rounded bg-primary/10 px-2 py-1 text-primary">Demo desa</span>
              <span className="text-muted-foreground">(default)</span>
            </li>
          </ul>
        </div>

        {/* Card: Tambah Desa */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-semibold mb-4">Tambah Desa Baru</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Masukkan identitas desa dan domain untuk mengaktifkan multi-tenant.
          </p>

          <form className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Nama Desa</label>
              <input
                type="text"
                className="w-full rounded border px-3 py-2"
                placeholder="Contoh: Desa Sukamaju"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Domain (host)</label>
              <input
                type="text"
                className="w-full rounded border px-3 py-2"
                placeholder="contoh: desa-sukamaju.id"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Tema</label>
              <select className="w-full rounded border px-3 py-2">
                <option value="esensi">Esensi (bawaan)</option>
                <option value="natra">Natra (modern)</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full rounded bg-primary py-2 text-primary-foreground hover:bg-primary/90"
            >
              Buat Desa
            </button>
          </form>
        </div>

        {/* Card: Statistik */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-semibold mb-4">Statistik</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-primary">1</div>
              <div className="text-sm text-muted-foreground">Total Desa</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">389</div>
              <div className="text-sm text-muted-foreground">Test lulus</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
