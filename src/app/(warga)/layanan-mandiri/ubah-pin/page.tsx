import { KeyRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UbahPinForm } from "@/features/warga/presentation/components/ubah-pin-form";
import { verifyWargaSession } from "@/lib/dal";

export const metadata: Metadata = { title: "Ubah PIN" };

export default async function UbahPinWargaPage() {
  const user = await verifyWargaSession();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {user.mustChangePin ? "Ganti PIN Sementara" : "Ubah PIN"}
        </h1>
        <p className="text-sm text-muted-foreground">
          PIN dipakai untuk masuk ke layanan mandiri bersama NIK Anda.
        </p>
      </div>

      {user.mustChangePin ? (
        <Alert>
          <KeyRound />
          <AlertTitle>PIN sementara wajib diganti</AlertTitle>
          <AlertDescription>
            Demi keamanan, ganti PIN yang diberikan operator sebelum mengajukan surat atau membuka
            dokumen.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Keamanan akun</CardTitle>
          <CardDescription>
            Gunakan 6 digit angka yang tidak mudah ditebak dan jangan bagikan kepada orang lain.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UbahPinForm wajibGanti={user.mustChangePin} />
        </CardContent>
      </Card>

      {!user.mustChangePin ? (
        <Button variant="outline" asChild>
          <Link href="/layanan-mandiri/beranda">Kembali ke beranda</Link>
        </Button>
      ) : null}
    </div>
  );
}
