import { Landmark } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components/login-form";
import { APP_NAME } from "@/lib/app-config";
import { getCurrentUser } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Masuk",
};

export default async function LoginPage({ searchParams }: PageProps<"/masuk">) {
  const user = await getCurrentUser();

  if (user) {
    if (user.residentId !== null) {
      redirect(user.mustChangePin ? "/layanan-mandiri/ubah-pin" : "/layanan-mandiri/beranda");
    }
    redirect("/beranda");
  }

  const params = await searchParams;
  const next =
    typeof params.next === "string" && params.next.startsWith("/") ? params.next : "/beranda";

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <div className="mx-auto mb-2 flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Landmark className="size-6" />
        </div>
        <CardTitle className="text-lg">{APP_NAME}</CardTitle>
        <CardDescription>
          Masuk untuk mengelola data desa atau memakai layanan mandiri warga.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <LoginForm next={next} />
        <p className="text-center text-sm text-muted-foreground">
          Belum punya akun layanan mandiri?{" "}
          <Link
            href="/desa/registrasi-warga"
            className="text-primary underline-offset-4 hover:underline"
          >
            Ajukan di sini
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  );
}
