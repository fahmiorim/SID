import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { getStatistikDesa } from "@/features/desa/application/statistik-desa";

export const dynamic = "force-dynamic";

export const metadata = { title: "Statistik Desa" };

const KATEGORI = [
  { key: "umur", label: "Kelompok Umur" },
  { key: "agama", label: "Agama" },
  { key: "pendidikan", label: "Pendidikan" },
  { key: "pekerjaan", label: "Pekerjaan" },
  { key: "status_kawin", label: "Status Perkawinan" },
] as const;

export default async function StatistikDesaPage() {
  const desa = await getIdentitasFromRequest();
  const statistik = await getStatistikDesa(desa.id);

  const ringkas = [
    { label: "Total Penduduk", nilai: statistik.total },
    { label: "Laki-laki", nilai: statistik.lakiLaki },
    { label: "Perempuan", nilai: statistik.perempuan },
    { label: "Kartu Keluarga", nilai: statistik.keluarga },
  ];

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Statistik Desa</h1>
        <p className="text-muted-foreground">
          Data kependudukan {desa.namaDesa ?? "desa"} yang bersumber dari basis data desa.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ringkas.map((item) => (
          <div key={item.label} className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">
              {item.nilai.toLocaleString("id-ID")}
            </p>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Sebaran per Dusun</h2>
        {statistik.perDusun.length === 0 ? (
          <p className="text-sm text-muted-foreground">Data wilayah belum tersedia.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dusun</TableHead>
                  <TableHead className="text-right">Jumlah Penduduk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statistik.perDusun.map((row) => (
                  <TableRow key={row.label}>
                    <TableCell>{row.label}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.total.toLocaleString("id-ID")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold tracking-tight">Rincian Kategori</h2>
          <Badge variant="secondary">Segera</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Rincian per {KATEGORI.map((item) => item.label.toLowerCase()).join(", ")} akan ditampilkan
          pada tahap berikutnya.
        </p>
      </section>
    </div>
  );
}
