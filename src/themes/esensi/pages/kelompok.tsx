import Link from "next/link";

import type { KelompokProps } from "@/themes/types";
import { ThemeCard, ThemeEmpty, ThemePageHeader, ThemePrintButton } from "@/themes/ui";

const TIPE_LABELS: Record<string, string> = {
  kelompok: "Kelompok Masyarakat",
  lembaga: "Lembaga Desa",
};

const gayaTerpilih = {
  backgroundColor: "var(--pub-primary)",
  color: "var(--pub-primary-foreground)",
};

const TAB = [
  { value: null, label: "Semua" },
  { value: "kelompok", label: "Kelompok" },
  { value: "lembaga", label: "Lembaga" },
] as const;

/**
 * Daftar kelompok masyarakat dan lembaga desa, beserta anggota yang
 * dipublikasikan operator (OS-WEB-010). NIK tidak pernah ditampilkan.
 */
export function EsensiKelompok({ ctx, kelompok, tipeAktif, anggota }: KelompokProps) {
  const anggotaPerKelompok = new Map(anggota.map((item) => [item.kelompokId, item.anggota]));
  const totalAnggota = anggota.reduce((total, item) => total + item.anggota.length, 0);

  return (
    <div className="space-y-8">
      <ThemePageHeader
        title="Kelompok & Lembaga"
        description={`Daftar kelompok masyarakat dan lembaga yang aktif di ${ctx.desa.namaDesa ?? "desa"}.`}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <nav className="flex flex-wrap gap-2" aria-label="Filter tipe kelompok">
          {TAB.map((tab) => (
            <Link
              key={tab.value ?? "semua"}
              href={tab.value ? `/desa/kelompok?tipe=${tab.value}` : "/desa/kelompok"}
              className="rounded-full border px-3 py-1 text-sm transition-colors hover:bg-accent"
              style={tipeAktif === tab.value ? gayaTerpilih : undefined}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        {totalAnggota > 0 ? <ThemePrintButton label="Cetak Daftar Anggota" /> : null}
      </div>

      {kelompok.length === 0 ? (
        <ThemeEmpty>Belum ada kelompok atau lembaga yang tercatat.</ThemeEmpty>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {kelompok.map((item) => {
            const daftarAnggota = anggotaPerKelompok.get(item.id) ?? [];

            return (
              <ThemeCard as="li" key={item.id} className="space-y-3 p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="font-semibold">{item.nama}</h2>
                  <span className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground">
                    {TIPE_LABELS[item.tipe] ?? item.tipe}
                  </span>
                </div>

                <dl className="space-y-1 text-sm">
                  <div className="flex gap-2">
                    <dt className="w-24 shrink-0 text-muted-foreground">Kategori</dt>
                    <dd>{item.kategori ?? "-"}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-24 shrink-0 text-muted-foreground">Ketua</dt>
                    <dd>{item.ketua ?? "-"}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-24 shrink-0 text-muted-foreground">Anggota</dt>
                    <dd>{item.jumlahAnggota.toLocaleString("id-ID")} orang</dd>
                  </div>
                  {item.kode ? (
                    <div className="flex gap-2">
                      <dt className="w-24 shrink-0 text-muted-foreground">Kode</dt>
                      <dd>{item.kode}</dd>
                    </div>
                  ) : null}
                </dl>

                {item.keterangan ? (
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.keterangan}</p>
                ) : null}

                <section className="space-y-2 border-t pt-3">
                  <h3 className="text-sm font-semibold">Anggota</h3>
                  {daftarAnggota.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Belum ada anggota yang dipublikasikan.
                    </p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-muted-foreground">
                          <th className="py-1 font-medium">Nama</th>
                          <th className="py-1 font-medium">Jabatan</th>
                          <th className="py-1 text-right font-medium">No. Anggota</th>
                        </tr>
                      </thead>
                      <tbody>
                        {daftarAnggota.map((anggotaItem, indeks) => (
                          <tr key={`${item.id}-${anggotaItem.nama}-${indeks}`} className="border-t">
                            <td className="py-1.5">{anggotaItem.nama}</td>
                            <td className="py-1.5 text-muted-foreground">{anggotaItem.jabatan}</td>
                            <td className="py-1.5 text-right text-muted-foreground">
                              {anggotaItem.nomorAnggota ?? "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </section>
              </ThemeCard>
            );
          })}
        </ul>
      )}
    </div>
  );
}
