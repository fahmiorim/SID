import { Building2, Globe2, LayoutDashboard, Users } from "lucide-react";
import type { Metadata } from "next";

import { NoAccess } from "@/components/shared/no-access";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  daftarDesaSuperAdmin,
  isSuperAdminUser,
} from "@/features/multi-desa/application/provisioning-use-cases";
import { DesaBaruForm } from "@/features/multi-desa/presentation/components/desa-baru-form";
import { verifySession } from "@/lib/dal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Super Admin — Multi-Desa",
  description: "Kelola desa, domain, dan akun administrator desa.",
};

export default async function SuperAdminDashboard() {
  const user = await verifySession();

  if (!(await isSuperAdminUser(user))) {
    return (
      <NoAccess
        title="Super Admin"
        description="Hanya role super admin yang boleh mengelola daftar desa."
      />
    );
  }

  const desa = await daftarDesaSuperAdmin();
  const totalPengguna = desa.reduce((jumlah, item) => jumlah + item.pengguna, 0);
  const totalPenduduk = desa.reduce((jumlah, item) => jumlah + item.penduduk, 0);
  const berdomain = desa.filter((item) => item.domain !== null).length;

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <LayoutDashboard className="size-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Super Admin — Multi-Desa</h1>
          <p className="text-sm text-muted-foreground">
            Kelola desa, domain publik, dan akun administrator desa.
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Building2 className="size-4" /> Desa terdaftar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{desa.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Globe2 className="size-4" /> Punya domain
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{berdomain}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Users className="size-4" /> Akun pengguna
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{totalPengguna}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Users className="size-4" /> Penduduk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{totalPenduduk}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar desa</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Desa</th>
                <th className="py-2 pr-4 font-medium">Kode</th>
                <th className="py-2 pr-4 font-medium">Domain</th>
                <th className="py-2 pr-4 font-medium">Tema</th>
                <th className="py-2 pr-4 text-right font-medium">Pengguna</th>
                <th className="py-2 pr-4 text-right font-medium">Penduduk</th>
                <th className="py-2 text-right font-medium">Jenis surat</th>
              </tr>
            </thead>
            <tbody>
              {desa.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-medium">{item.name ?? "—"}</td>
                  <td className="py-2 pr-4 tabular-nums">{item.code ?? "—"}</td>
                  <td className="py-2 pr-4">{item.domain ?? "belum dipetakan"}</td>
                  <td className="py-2 pr-4">{item.tema ?? "—"}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{item.pengguna}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{item.penduduk}</td>
                  <td className="py-2 text-right tabular-nums">{item.jenisSurat}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Buat desa baru</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Role, katalog menu, matriks akses, tema, menu publik, dan katalog surat disalin dari
            desa pertama sebagai cetakan. Akun administrator desa baru langsung dapat dipakai masuk.
          </p>
          <DesaBaruForm />
        </CardContent>
      </Card>
    </div>
  );
}
