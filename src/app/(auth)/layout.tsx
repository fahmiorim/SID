import { FileText, Landmark, ShieldCheck, Users, Wallet } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { APP_NAME } from "@/lib/app-config";

const FITUR = [
  { icon: FileText, label: "Layanan surat warga" },
  { icon: Users, label: "Data kependudukan" },
  { icon: Wallet, label: "Transparansi anggaran" },
];

/**
 * Layout grup rute masuk.
 *
 * Satu panel brand yang tenang di kiri, formulir di kanan. Di layar kecil panel
 * brand diringkas menjadi identitas desa di atas formulir agar tidak memakan
 * ruang isian.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-1 overflow-hidden bg-[var(--warm-paper)]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 size-[30rem] rounded-full bg-[var(--brand)]/10 blur-3xl" />
        <div className="absolute -bottom-48 -left-24 size-[26rem] rounded-full bg-[var(--brand-accent)]/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgb(255_255_255/0.9),transparent_42%)]" />
      </div>

      <div className="relative mx-auto grid w-full max-w-[86rem] flex-1 items-center gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(27rem,30rem)] lg:gap-16 lg:px-12 lg:py-10">
        <section className="ui-reveal relative hidden min-h-[38rem] overflow-hidden rounded-[2rem] bg-[var(--brand)] p-10 text-[var(--brand-foreground)] shadow-[0_35px_80px_-40px_color-mix(in_srgb,var(--brand)_80%,transparent)] lg:flex lg:flex-col xl:p-12">
          <div aria-hidden="true" className="ui-grid-lines absolute inset-0" />
          <div
            aria-hidden="true"
            className="ui-soft-pulse absolute -top-28 -right-24 size-[24rem] rounded-full border border-white/10 bg-[var(--brand-accent)]/10 blur-2xl"
          />
          <div
            aria-hidden="true"
            className="absolute -right-24 -bottom-36 size-[26rem] rounded-full border border-white/10"
          />

          <Link
            href="/"
            className="relative flex w-fit items-center gap-3 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-white/40"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
              <Landmark className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-[10px] font-semibold tracking-[0.2em] text-white/65 uppercase">
                Pemerintah Desa
              </span>
              <span className="mt-0.5 block max-w-64 truncate text-sm font-semibold">
                {APP_NAME}
              </span>
            </span>
          </Link>

          <div className="relative mt-auto pt-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase">
              <span className="size-1.5 rounded-full bg-[var(--brand-accent)]" aria-hidden="true" />
              Ruang kerja desa
            </span>

            <h2 className="mt-5 max-w-lg text-4xl leading-[1.08] font-bold tracking-[-0.035em] text-balance xl:text-[2.85rem]">
              Satu alur kerja untuk melayani desa.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
              Kelola layanan warga, administrasi, dan data desa dari satu tempat yang aman.
            </p>

            <ul className="mt-8 space-y-3">
              {FITUR.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label} className="flex items-center gap-3 text-sm text-white/85">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    {item.label}
                  </li>
                );
              })}
            </ul>

            <div className="mt-10 flex items-center gap-2.5 border-t border-white/15 pt-5 text-xs text-white/60">
              <ShieldCheck className="size-4 text-[var(--brand-accent)]" aria-hidden="true" />
              Akses staf dan warga dikelola dengan izin terpisah.
            </div>
          </div>
        </section>

        <div className="mx-auto w-full max-w-[27rem] lg:mx-0">
          <div className="ui-reveal mb-8 flex items-center justify-between lg:hidden">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--brand)] text-[var(--brand-foreground)]">
                <Landmark className="size-5" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold">{APP_NAME}</span>
            </Link>
            <span className="rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] text-[var(--brand)] uppercase">
              Portal desa
            </span>
          </div>

          <div className="ui-reveal" style={{ animationDelay: "90ms" }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
