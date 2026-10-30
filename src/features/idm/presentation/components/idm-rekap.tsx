import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatSkor, type RekapIdm } from "@/features/idm/domain/idm";

const STATUS_CLASS: Record<string, string> = {
  "Sangat Tertinggal": "text-destructive",
  Tertinggal: "text-orange-600",
  Berkembang: "text-amber-600",
  Maju: "text-emerald-600",
  Mandiri: "text-emerald-700",
};

/** Ringkasan skor IDM dan ketiga dimensinya untuk satu tahun. */
export function IdmRekap({ rekap }: { rekap: RekapIdm }) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-normal text-muted-foreground">Skor IDM</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">{formatSkor(rekap.skor)}</p>
            <p className={`text-sm ${rekap.status ? (STATUS_CLASS[rekap.status] ?? "") : ""}`}>
              {rekap.status ?? "Belum ada indikator terisi"}
            </p>
          </CardContent>
        </Card>

        {rekap.dimensi.map((dimensi) => (
          <Card key={dimensi.id}>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-normal text-muted-foreground">
                {dimensi.kode} · {dimensi.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tabular-nums">{formatSkor(dimensi.skor)}</p>
              <p className="text-sm text-muted-foreground">
                {dimensi.jumlahIndikator} indikator terisi
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Skor IDM dihitung dari rata-rata ketiga dimensi (IKS, IKE, IKL). Indikator dikelompokkan
        dari kode: <code>I.*</code> sosial, <code>II.*</code> ekonomi, <code>III.*</code>{" "}
        lingkungan.
      </p>
    </div>
  );
}
