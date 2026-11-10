import type { ReactNode } from "react";

import { SkipLink } from "@/components/shared/skip-link";
import { SOSMED_LABELS, type SosmedLink } from "@/features/publik/domain/theme";
import { sanitasiHtml } from "@/lib/sanitize";

/**
 * Primitif tampilan bersama untuk tema (Fase 1D.5).
 *
 * Tema **boleh** memakai komponen ini, tetapi tidak wajib — tujuannya agar
 * perilaku yang berulang (judul halaman, kartu statistik, grid, galeri) tetap
 * konsisten dan tidak perlu ditulis ulang di setiap tema.
 *
 * Gaya memakai CSS variable `--pub-*` yang dipasang wrapper situs publik
 * (`PublicThemeWrapper`), sehingga warna/radius/font mengikuti opsi tema.
 */

/**
 * Lebar isi situs publik.
 *
 * Dipakai bersama oleh kedua tema agar header, isi, dan footer berhenti di
 * titik yang sama. Lebar ini menggantikan `max-w-6xl` (72rem) yang membuat
 * konten terasa sempit di layar lebar, sementara `px-4..lg:px-8` menjaga gutter
 * tumbuh di layar besar tanpa membuat baris teks menyentuh tepi.
 */
export const TEMA_WADAH = "mx-auto w-full max-w-[84rem] px-4 sm:px-6 lg:px-8";

/**
 * Render HTML konten ter-sanitasi (berita, halaman statis, widget).
 *
 * Sanitasi diulang di sini sebagai lapisan kedua walau action sudah
 * membersihkan saat menyimpan — data lama/impor bisa saja belum bersih.
 * `dangerouslySetInnerHTML` memakai hasil yang **sudah** dibersihkan.
 */
export function KontenHtml({ html, className }: { html: string; className?: string }) {
  const bersih = sanitasiHtml(html);
  return (
    <div
      className={className ?? "prose-desa space-y-4 text-sm leading-relaxed"}
      dangerouslySetInnerHTML={{ __html: bersih }}
    />
  );
}

/** Tautan "lewati ke konten utama" untuk tema publik. */
export function ThemeSkipLink({ targetId = "konten-utama" }: { targetId?: string }) {
  return <SkipLink targetId={targetId} />;
}

export function ThemePageHeader({
  title,
  description,
  eyebrow,
}: {
  title: string;
  description?: string | null;
  eyebrow?: string;
}) {
  return (
    <header className="max-w-3xl">
      {eyebrow ? (
        <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.2em] text-[var(--pub-primary-text)] uppercase">
          <span
            aria-hidden="true"
            className="h-px w-8 shrink-0"
            style={{ backgroundColor: "var(--pub-primary)" }}
          />
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-3 text-[2rem] leading-[1.05] font-bold tracking-[-0.03em] text-balance sm:text-[2.75rem]">
        {title}
      </h1>
      {description ? (
        <p className="mt-3.5 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </header>
  );
}

export function ThemeCard({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article" | "section";
}) {
  return (
    <Tag
      className={`overflow-hidden border bg-card shadow-[0_1px_2px_rgb(15_23_42_/_0.05)] ${className ?? ""}`}
      style={{ borderRadius: "var(--pub-radius)" }}
    >
      {children}
    </Tag>
  );
}

export function ThemeButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline";
}) {
  const gaya =
    variant === "primary"
      ? { backgroundColor: "var(--pub-primary)", color: "var(--pub-primary-foreground)" }
      : undefined;

  return (
    <a
      href={href}
      style={{ ...gaya, borderRadius: "var(--pub-radius)" }}
      className={`inline-flex shrink-0 items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold whitespace-nowrap transition-opacity hover:opacity-90 ${
        variant === "outline" ? "border" : ""
      }`}
    >
      {children}
    </a>
  );
}

export function ThemeStatGrid({ items }: { items: { label: string; nilai: number | string }[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <ThemeCard key={item.label} className="p-5">
          <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            {item.label}
          </p>
          <p className="mt-3 text-[1.65rem] leading-none font-bold tracking-tight tabular-nums sm:text-[1.85rem]">
            {typeof item.nilai === "number" ? item.nilai.toLocaleString("id-ID") : item.nilai}
          </p>
        </ThemeCard>
      ))}
    </div>
  );
}

export function ThemeEmpty({ children }: { children: ReactNode }) {
  return (
    <p className="mx-auto max-w-xl rounded-[var(--pub-radius)] border border-dashed p-10 text-center text-sm leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}

export { ThemePrintButton } from "./print-button";

export function ThemeProse({ html, className }: { html: string; className?: string }) {
  return <KontenHtml html={html} className={className} />;
}

/** Teks berjalan di bawah header; disembunyikan bila teks kosong. */
export function TemaTeksBerjalan({ teks }: { teks: string }) {
  const isi = teks.trim();
  if (!isi) return null;

  return (
    <div
      className="tema-teks-berjalan border-b"
      style={{
        backgroundColor: "var(--pub-primary)",
        color: "var(--pub-primary-foreground)",
      }}
    >
      <p className="sr-only">{isi}</p>
      <div className={`${TEMA_WADAH} overflow-hidden`} aria-hidden="true">
        <div className="tema-teks-berjalan-track flex w-max py-2 text-sm font-medium">
          <span className="shrink-0 px-8">{isi}</span>
          <span className="shrink-0 px-8">{isi}</span>
        </div>
      </div>
    </div>
  );
}

/** Daftar tautan sosial media untuk footer tema. */
export function TemaSosmed({ items }: { items: readonly SosmedLink[] }) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {items.map((item, index) => (
        <a
          key={`${item.platform}-${index}`}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="underline-offset-4 hover:underline"
        >
          {SOSMED_LABELS[item.platform]}
        </a>
      ))}
    </div>
  );
}
