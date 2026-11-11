import { ArrowUpRight, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/features/auth/components/login-form";
import { buatCaptcha } from "@/lib/captcha";
import { getCurrentUser } from "@/lib/dal";
import { env } from "@/lib/env";

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
  const captcha = buatCaptcha(env.BETTER_AUTH_SECRET);

  return (
    <div>
      <div className="mb-7">
        <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--brand)] uppercase">
          Portal resmi desa
        </p>
        <h1 className="mt-2 text-[2rem] leading-[1.1] font-bold tracking-[-0.035em] text-balance">
          Masuk ke ruang kerja
        </h1>
        <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Kelola data desa atau gunakan layanan mandiri warga dengan akun yang terdaftar.
        </p>
      </div>

      <div className="rounded-2xl border border-black/[0.06] bg-white/85 p-5 shadow-[var(--shadow-soft)] ring-1 ring-white/60 backdrop-blur-xl sm:p-7">
        <LoginForm
          next={next}
          captchaPertanyaan={captcha.pertanyaan}
          captchaToken={captcha.token}
        />

        <div className="my-5 h-px bg-black/[0.06]" />

        <p className="text-center text-sm text-muted-foreground">
          Belum punya akun layanan mandiri?{" "}
          <Link
            href="/desa/registrasi-warga"
            className="font-semibold text-[var(--brand)] underline-offset-4 hover:underline"
          >
            Ajukan di sini
          </Link>
          .
        </p>
      </div>

      <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5 text-[var(--brand)]" aria-hidden="true" />
        Sesi aman untuk staf dan warga terdaftar.
      </p>

      <Link
        href="/"
        className="mx-auto mt-4 flex w-fit items-center gap-1 text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        Kembali ke portal desa
        <ArrowUpRight className="size-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
}
