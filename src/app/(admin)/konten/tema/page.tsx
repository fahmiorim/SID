import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { NoAccess } from "@/components/shared/no-access";
import { Button } from "@/components/ui/button";
import { getPengaturanTema } from "@/features/publik/application/tema-use-cases";
import { opsiKeForm, TEMA_RESOURCE } from "@/features/publik/domain/tema";
import { TemaForm } from "@/features/publik/presentation/components/tema-form";
import { TemaSwitcher } from "@/features/publik/presentation/components/tema-switcher";
import { hasPermission } from "@/features/rbac/application/authorization";
import { verifySession } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Tema Situs",
};

/**
 * Pengaturan tema situs publik (Fase 1D.7).
 *
 * Operator memilih tema terpasang dan mengatur opsinya (warna, font, hero,
 * susunan beranda). Pemilihan tema hanya merujuk registry di `src/themes/`;
 * tidak ada unggahan tema saat runtime.
 */
export default async function TemaPage() {
  const user = await verifySession();

  if (!hasPermission(user.permissions, TEMA_RESOURCE, "read")) {
    return (
      <NoAccess
        title="Tema Situs"
        description="Pilih tema dan atur warna, tipografi, serta susunan beranda situs publik."
      />
    );
  }

  const { aktif, daftar } = await getPengaturanTema();
  const canManage = hasPermission(user.permissions, TEMA_RESOURCE, "update");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tema Situs"
        description="Pilih tampilan situs publik dan atur opsinya. Tema dikompilasi saat build."
        actions={
          <Button asChild variant="outline">
            <Link href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4" />
              Lihat situs
            </Link>
          </Button>
        }
      />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Tema terpasang</h2>
        <TemaSwitcher
          canManage={canManage}
          daftar={daftar.map(({ manifest, aktif: sedangAktif }) => ({
            slug: manifest.slug,
            nama: manifest.nama,
            versi: manifest.versi,
            deskripsi: manifest.deskripsi,
            warnaPratinjau: manifest.warnaPratinjau,
            aktif: sedangAktif,
          }))}
        />
      </section>

      <TemaForm
        nilai={opsiKeForm(aktif.opsi)}
        canManage={canManage}
        namaTema={aktif.manifest.nama}
      />
    </div>
  );
}
