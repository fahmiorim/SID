import { cn } from "cn";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Kartu ringkasan di atas halaman daftar admin.
 *
 * `utama` memberi satu kartu fokus berwarna brand, sisanya memakai permukaan
 * putih hangat yang sama dengan beranda admin. Nilai boleh berupa teks sudah
 * diformat agar halaman dapat menampilkan rupiah, rentang, atau persentase.
 */
export function AdminStat({
  label,
  nilai,
  keterangan,
  ikon: Ikon,
  utama = false,
  className,
}: {
  label: string;
  nilai: ReactNode;
  keterangan?: ReactNode;
  ikon: LucideIcon;
  utama?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "ui-reveal relative overflow-hidden rounded-2xl border p-4 sm:p-5",
        utama
          ? "border-transparent bg-[var(--brand)] text-[var(--brand-foreground)] shadow-[0_26px_54px_-34px_var(--brand)]"
          : "border-black/[0.06] bg-card shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      {utama ? (
        <>
          <div aria-hidden="true" className="ui-grid-lines absolute inset-0 opacity-50" />
          <div
            aria-hidden="true"
            className="absolute -top-12 -right-10 size-32 rounded-full bg-[var(--brand-accent)]/10 blur-2xl"
          />
        </>
      ) : null}

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={cn(
              "text-[10px] font-semibold tracking-[0.14em] uppercase",
              utama ? "text-white/60" : "text-muted-foreground",
            )}
          >
            {label}
          </p>
          <p className="mt-2 truncate text-[1.45rem] leading-none font-bold tracking-[-0.03em] tabular-nums sm:text-[1.65rem]">
            {nilai}
          </p>
        </div>
        <span
          className={cn(
            "hidden size-9 shrink-0 items-center justify-center rounded-xl ring-1 sm:flex",
            utama
              ? "bg-white/10 text-white/80 ring-white/15"
              : "bg-[var(--brand-soft)] text-[var(--brand)] ring-[var(--brand)]/10",
          )}
        >
          <Ikon className="size-4" aria-hidden="true" />
        </span>
      </div>

      {keterangan ? (
        <p
          className={cn(
            "relative mt-3 text-xs leading-relaxed",
            utama ? "text-white/60" : "text-muted-foreground",
          )}
        >
          {keterangan}
        </p>
      ) : null}
    </div>
  );
}

/** Panel daftar: toolbar di atas, isi tabel, dan footer paginasi. */
export function AdminListPanel({
  toolbar,
  footer,
  children,
}: {
  toolbar?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="ui-reveal overflow-hidden rounded-2xl border border-black/[0.06] bg-card shadow-[var(--shadow-soft)]">
      {toolbar ? (
        <div className="border-b border-black/[0.05] bg-[var(--warm-paper)]/70 p-4 sm:p-5">
          {toolbar}
        </div>
      ) : null}
      <div className="p-4 sm:p-5">{children}</div>
      {footer ? (
        <div className="border-t border-black/[0.05] px-4 py-3.5 sm:px-5">{footer}</div>
      ) : null}
    </section>
  );
}

/**
 * Bingkai tabel daftar admin. Header tabel dibuat tenang (huruf kecil, renggang)
 * agar isi baris lebih menonjol; padding sel dinaikkan supaya daftar tidak padat.
 */
export function AdminTableFrame({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-black/[0.06] [&_tbody_tr]:border-black/[0.04] [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-[var(--warm-paper)]/60 [&_td]:px-3 [&_td]:py-3 [&_thead_th]:h-11 [&_thead_th]:px-3 [&_thead_th]:text-[10px] [&_thead_th]:font-semibold [&_thead_th]:tracking-[0.12em] [&_thead_th]:text-muted-foreground [&_thead_th]:uppercase [&_thead_tr]:border-black/[0.06] [&_thead_tr]:bg-[var(--warm-paper)]">
      <p className="border-b border-black/[0.05] bg-white px-3 py-2 text-[11px] text-muted-foreground md:hidden">
        Geser tabel ke samping untuk melihat seluruh kolom.
      </p>
      {children}
    </div>
  );
}
