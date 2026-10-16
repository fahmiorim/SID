import { Landmark } from "lucide-react";
import type { Metadata } from "next";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components/login-form";
import { APP_NAME } from "@/lib/app-config";

export const metadata: Metadata = {
  title: "Masuk",
};

export default async function LoginPage({ searchParams }: PageProps<"/masuk">) {
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
        <CardDescription>Masuk untuk mengelola data desa.</CardDescription>
      </CardHeader>

      <CardContent>
        <LoginForm next={next} />
      </CardContent>
    </Card>
  );
}
