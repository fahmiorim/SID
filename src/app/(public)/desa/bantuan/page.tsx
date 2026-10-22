import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listBantuanProgramPublik } from "@/features/bantuan/infrastructure/bantuan-repository";
import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";

export const dynamic = "force-dynamic";

export const metadata = { title: "Program Bantuan Sosial" };

const SASARAN_LABELS: Record<number, string> = {
  1: "Penduduk",
  2: "Keluarga",
  3: "Rumah Tangga",
  4: "Kelompok",
};

const ASAL_DANA_LABELS: Record<number, string> = {
  1: "APBN / Pemerintah Pusat",
  2: "APBD Provinsi",
  3: "APBD Kabupaten/Kota",
  4: "Dana Desa",
  5: "Lainnya",
};

export default async function BantuanPublikPage() {
  const desa = await getIdentitasFromRequest();
  const program = await listBantuanProgramPublik(desa.id);

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Program Bantuan Sosial</h1>
        <p className="text-muted-foreground">
          Daftar program bantuan yang dikelola {desa.namaDesa ?? "desa"}.
        </p>
      </header>

      {program.length === 0 ? (
        <p className="rounded-xl border p-6 text-sm text-muted-foreground">
          Belum ada program bantuan yang tercatat.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program</TableHead>
                <TableHead>Sasaran</TableHead>
                <TableHead>Sumber Dana</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {program.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.nama}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{SASARAN_LABELS[row.sasaran] ?? "Lainnya"}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.asalDana ? (ASAL_DANA_LABELS[row.asalDana] ?? "—") : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
