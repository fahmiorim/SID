import { BadgeCheck, Mail, Shield, UserCog, User as UserIcon } from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfilSaya } from "@/features/pengguna/application/pengguna-use-cases";

export const metadata: Metadata = {
  title: "Profil Saya",
};

function Baris({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:gap-4">
      <span className="w-48 shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export default async function ProfilPage() {
  const profil = await getProfilSaya();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profil Saya"
        description="Informasi akun yang sedang Anda gunakan. Hubungi administrator untuk mengubah data ini."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="size-5" />
            Akun
          </CardTitle>
          <CardDescription>Detail akun dan grup akses Anda.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          <Baris
            label="Nama"
            value={
              <span className="flex items-center gap-2">
                <UserIcon className="size-4 text-muted-foreground" />
                {profil.name}
              </span>
            }
          />
          <Baris
            label="Username"
            value={profil.username || <span className="text-muted-foreground">—</span>}
          />
          <Baris
            label="Email"
            value={
              <span className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" />
                {profil.email}
              </span>
            }
          />
          <Baris
            label="Grup Akses"
            value={
              <span className="flex items-center gap-2">
                <Shield className="size-4 text-muted-foreground" />
                {profil.roleName ?? <span className="text-muted-foreground">—</span>}
              </span>
            }
          />
          <Baris
            label="Status"
            value={
              <Badge variant={profil.active ? "secondary" : "outline"}>
                {profil.active ? "Aktif" : "Nonaktif"}
              </Badge>
            }
          />
          <Baris
            label="Login Terakhir"
            value={
              profil.lastLoginAt ? (
                <span className="flex items-center gap-2">
                  <BadgeCheck className="size-4 text-muted-foreground" />
                  {profil.lastLoginAt.toLocaleString("id-ID")}
                </span>
              ) : (
                <span className="text-muted-foreground">Belum pernah</span>
              )
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
