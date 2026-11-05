import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { PrintButton } from "@/components/shared/print-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listPerangkat } from "@/features/konten/application/perangkat-use-cases";
import { PERANGKAT_DESA_RESOURCE } from "@/features/konten/domain/perangkat";
import { susunBaganSotk, type SotkNode } from "@/features/konten/domain/sotk";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Bagan SOTK Desa",
};

function KotakPerangkat({ node, utama = false }: { node: SotkNode; utama?: boolean }) {
  return (
    <div
      className={`mx-auto w-full max-w-xs rounded-lg border px-3 py-2 text-center ${
        utama ? "bg-primary/5" : ""
      }`}
    >
      <p className="font-semibold">{node.nama}</p>
      <p className="text-xs text-muted-foreground">{node.jabatan ?? "Tanpa jabatan"}</p>
      {node.nip ? <p className="text-[11px] text-muted-foreground">NIP: {node.nip}</p> : null}
    </div>
  );
}

export default async function SotkPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, PERANGKAT_DESA_RESOURCE, "read")) {
    return (
      <NoAccess
        title="Bagan SOTK Desa"
        description="Struktur organisasi dan tata kerja pemerintahan desa."
      />
    );
  }

  const perangkat = await listPerangkat();
  const bagan = susunBaganSotk(perangkat);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bagan SOTK Desa"
        description="Struktur organisasi dan tata kerja pemerintahan desa berdasarkan jabatan perangkat aktif."
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Button asChild variant="outline">
              <Link href="/konten/perangkat">Kembali</Link>
            </Button>
            <PrintButton />
          </div>
        }
      />

      <Card>
        <CardContent className="space-y-4">
          {bagan.totalAktif === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Belum ada perangkat aktif. Tambahkan perangkat lewat menu Perangkat Desa.
            </p>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-center text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Kepala Desa
                </p>
                {bagan.kepala ? (
                  <KotakPerangkat node={bagan.kepala} utama />
                ) : (
                  <p className="text-center text-xs text-muted-foreground">
                    Jabatan Kepala Desa belum terisi.
                  </p>
                )}
              </div>

              <div className="mx-auto h-6 w-px bg-border" aria-hidden />

              <div>
                <p className="mb-2 text-center text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Sekretariat
                </p>
                {bagan.sekretaris ? (
                  <KotakPerangkat node={bagan.sekretaris} />
                ) : (
                  <p className="text-center text-xs text-muted-foreground">
                    Jabatan Sekretaris Desa belum terisi.
                  </p>
                )}
              </div>

              {bagan.staf.length > 0 ? (
                <>
                  <div className="mx-auto h-6 w-px bg-border" aria-hidden />
                  <div>
                    <p className="mb-2 text-center text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      Perangkat Pelaksana
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {bagan.staf.map((node) => (
                        <KotakPerangkat key={node.id} node={node} />
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground print:hidden">
        Bagan diturunkan dari nama jabatan perangkat aktif. Ubah jabatan atau status perangkat di{" "}
        <Link href="/konten/perangkat" className="underline">
          Perangkat Desa
        </Link>
        .
      </p>
    </div>
  );
}
