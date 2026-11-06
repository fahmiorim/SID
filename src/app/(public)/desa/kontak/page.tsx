import type { Metadata } from "next";

import { siapkanTema } from "@/features/publik/application/siapkan-tema";
import { buatCaptcha } from "@/lib/captcha";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Kontak Desa" };

export default async function KontakPage() {
  const { ctx, tema } = await siapkanTema();
  const captcha = buatCaptcha(env.BETTER_AUTH_SECRET);

  const Kontak = tema.kontak;

  return <Kontak ctx={ctx} captcha={captcha} />;
}
