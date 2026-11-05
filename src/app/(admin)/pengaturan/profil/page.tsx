import { BadgeCheck, KeyRound, Mail, Shield, UserCog, User as UserIcon } from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { setOtpLoginAktifAction } from "@/features/auth/actions";
import { siapkanOtpLogin } from "@/features/auth/application/login-otp-use-cases";
import { getOtpLoginAktif } from "@/features/auth/infrastructure/auth-repository";
import { getProfilSaya } from "@/features/pengguna/application/pengguna-use-cases";
import { requireUser } from "@/lib/dal";

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

export default async function ProfilPage({ searchParams }: PageProps<"/pengaturan/profil">) {
  const profil = await getProfilSaya();
  const user = await requireUser();
  const otpAktif = await getOtpLoginAktif(user.id);
  const siapOtp = await siapkanOtpLogin(user.id);
  const params = await searchParams;
  const pesanOtp =
    params.otp === "aktif"
      ? "OTP login diaktifkan."
      : params.otp === "nonaktif"
        ? "OTP login dinonaktifkan."
        : params.otp === "gagal"
          ? "OTP tidak dapat diaktifkan: tentukan nomor HP atau email terlebih dahulu."
          : null;

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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-5" />
            OTP Login
          </CardTitle>
          <CardDescription>
            Minta kode 6 digit sebagai faktor kedua saat masuk. Kode dikirim ke WhatsApp (bila nomor
            HP terdaftar) atau email akun.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {pesanOtp ? <p className="text-sm text-muted-foreground">{pesanOtp}</p> : null}
          <p className="text-sm">
            Status:{" "}
            <Badge variant={otpAktif ? "default" : "secondary"}>
              {otpAktif ? "Aktif" : "Nonaktif"}
            </Badge>
          </p>
          {siapOtp.bisa ? (
            <form action={setOtpLoginAktifAction}>
              <input type="hidden" name="aktif" value={String(!otpAktif)} />
              <Button type="submit" size="sm" variant={otpAktif ? "outline" : "default"}>
                {otpAktif ? "Nonaktifkan OTP" : "Aktifkan OTP"}
              </Button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nomor HP dan email belum tersedia, sehingga OTP belum dapat diaktifkan.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-5" />
            TOTP (Authenticator App)
          </CardTitle>
          <CardDescription>
            Gunakan aplikasi authenticator (Google Authenticator, Authy, dll.) untuk generate kode 6
            digit yang tersinkronisasi dengan perangkat Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">
            Status: <Badge variant="secondary">Belum dikonfigurasi</Badge>
          </p>
          <p className="text-sm text-muted-foreground">
            Tambahkan aplikasi authenticator ke perangkat, lalu pindai QR code atau masukkan secret
            yang ditampilkan setelah mengklik tombol di bawah.
          </p>
          <div className="flex gap-2">
            <Button size="sm">Setup TOTP</Button>
            <Button size="sm" variant="outline" disabled>
              Verifikasi
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
