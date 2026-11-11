import { ArrowUpRight, LayoutGrid, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { MenuIcon } from "@/components/layout/menu-icon";
import { Button } from "@/components/ui/button";
import { getIdentitas } from "@/features/desa/application/get-identitas";
import { ambilShortcutBeranda } from "@/features/navigation/application/shortcut-use-cases";
import { ambilMenuSidebar } from "@/features/navigation/application/urutan-menu-use-cases";
import { ShortcutPicker } from "@/features/navigation/presentation/components/shortcut-picker";
import { UrutanMenuPicker } from "@/features/navigation/presentation/components/urutan-menu-picker";
import { verifySession } from "@/lib/dal";

export const dynamic = "force-dynamic";

function Ringkasan({ label, nilai }: { label: string; nilai: string | number }) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/10 px-3.5 py-3 backdrop-blur-sm">
      <dt className="text-[9px] font-semibold tracking-[0.14em] text-white/55 uppercase">
        {label}
      </dt>
      <dd className="mt-1 truncate text-lg leading-tight font-bold tracking-tight tabular-nums">
        {typeof nilai === "number" ? nilai.toLocaleString("id-ID") : nilai}
      </dd>
    </div>
  );
}

export default async function BerandaPage() {
  const user = await verifySession();
  const desa = await getIdentitas();
  const [{ shortcut, tujuan }, { menu, pilihan: menuPilihan, terpilih: menuTerpilih }] =
    await Promise.all([ambilShortcutBeranda(user), ambilMenuSidebar(user)]);

  const namaDesa = desa?.namaDesa ?? "Desa";

  return (
    <div className="space-y-7">
      <section className="ui-reveal relative overflow-hidden rounded-[1.75rem] bg-[var(--brand)] p-6 text-[var(--brand-foreground)] shadow-[0_30px_60px_-34px_var(--brand)] sm:p-8">
        <div aria-hidden="true" className="ui-grid-lines absolute inset-0 opacity-60" />
        <div
          aria-hidden="true"
          className="ui-soft-pulse absolute -top-28 -right-20 size-80 rounded-full bg-[var(--brand-accent)]/10 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="absolute -right-16 -bottom-28 size-64 rounded-full border border-white/10"
        />

        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.18em] text-white/60 uppercase">
                <span
                  className="size-1.5 rounded-full bg-[var(--brand-accent)]"
                  aria-hidden="true"
                />
                Ruang kerja desa
              </p>
              <h1 className="mt-3 text-3xl leading-tight font-bold tracking-[-0.035em] sm:text-[2.15rem]">
                Beranda
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">
                Selamat datang, {user.name}. Anda sedang mengelola {namaDesa}.
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/80 backdrop-blur-sm">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Akses pengelola
            </span>
          </div>

          <dl className="mt-7 grid max-w-2xl gap-2.5 sm:grid-cols-3">
            <Ringkasan label="Shortcut aktif" nilai={shortcut.length} />
            <Ringkasan label="Menu tersedia" nilai={menu.length} />
            <Ringkasan label="Desa" nilai={namaDesa} />
          </dl>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Ruang kerja personal
            </p>
            <h2 className="mt-1 text-lg font-bold tracking-[-0.02em]">Shortcut saya</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Pintasan yang paling sering Anda gunakan.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {menuPilihan.length > 1 ? (
              <UrutanMenuPicker pilihan={menuPilihan} terpilih={menuTerpilih} />
            ) : null}
            {tujuan.length > 0 ? (
              <ShortcutPicker pilihan={tujuan} terpilih={shortcut.map((item) => item.href)} />
            ) : null}
          </div>
        </div>

        {shortcut.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {shortcut.map((item, indeks) => (
              <article
                key={item.href}
                className="ui-reveal ui-hover-lift group flex flex-col rounded-2xl border border-black/[0.06] bg-card p-4 shadow-[var(--shadow-soft)]"
                style={{ animationDelay: `${indeks * 45}ms` }}
              >
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)] ring-1 ring-[var(--brand)]/10 transition-transform duration-300 group-hover:-rotate-3">
                    <LayoutGrid className="size-[18px]" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold tracking-[-0.01em]">
                      {item.label}
                    </h3>
                    <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground/80">
                      {item.href}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-2 border-t border-black/[0.05] pt-3">
                  <span className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    Pintasan
                  </span>
                  <Button asChild size="sm" variant="ghost" className="rounded-lg">
                    <Link href={item.href}>
                      Buka
                      <ArrowUpRight
                        className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        aria-hidden="true"
                      />
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
            Belum ada menu yang dapat dijadikan shortcut.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-black/[0.06] bg-card p-5 shadow-[var(--shadow-soft)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold tracking-[-0.015em]">Menu di ruang kerja</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Modul yang dapat Anda akses sesuai izin akun.
            </p>
          </div>
          <span className="rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-[10px] font-semibold text-[var(--brand)]">
            {menu.length} menu
          </span>
        </div>

        <ul className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {menu.slice(0, 9).map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-black/[0.05] bg-[var(--warm-paper)]/70 px-3 py-2.5"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-[var(--brand)] ring-1 ring-black/[0.04]">
                <MenuIcon name={item.icon} className="size-4" />
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{item.label}</span>
              {item.children.length > 0 ? (
                <span className="text-[10px] text-muted-foreground">
                  {item.children.length} sub
                </span>
              ) : null}
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.05] pt-4">
          <p className="text-xs text-muted-foreground">
            Ingin membuka profil akun atau mengubah tampilan?
          </p>
          <Button asChild size="sm" variant="outline" className="rounded-lg">
            <Link href="/pengaturan/profil">Profil saya</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
