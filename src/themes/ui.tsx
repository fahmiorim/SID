import type { ReactNode } from "react";

import { SOCIAL_PLATFORM_LABELS, type SosmedItem } from "@/features/publik/domain/theme";
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
    <header className="space-y-2">
      {eyebrow ? (
        <span
          className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-[var(--pub-primary-foreground)]"
          style={{ backgroundColor: "var(--pub-primary)" }}
        >
          {eyebrow}
        </span>
      ) : null}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      {description ? <p className="text-muted-foreground">{description}</p> : null}
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
      className={`overflow-hidden border bg-card ${className ?? ""}`}
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
      style={gaya}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 ${
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
          <p className="text-sm text-muted-foreground">{item.label}</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">
            {typeof item.nilai === "number" ? item.nilai.toLocaleString("id-ID") : item.nilai}
          </p>
        </ThemeCard>
      ))}
    </div>
  );
}

export function ThemeEmpty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

export function ThemePrintButton({ label = "Cetak" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => typeof window !== "undefined" && window.print()}
      className="tema-button-primary inline-flex items-center gap-2 px-4 py-2 text-sm font-medium"
    >
      {label}
    </button>
  );
}

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
      <div className="mx-auto w-full max-w-6xl overflow-hidden px-4 sm:px-6" aria-hidden="true">
        <div className="tema-teks-berjalan-track flex w-max py-2 text-sm font-medium">
          <span className="shrink-0 px-8">{isi}</span>
          <span className="shrink-0 px-8">{isi}</span>
        </div>
      </div>
    </div>
  );
}

/** Daftar tautan sosial media untuk footer tema. */
export function TemaSosmed({ items }: { items: readonly SosmedItem[] }) {
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
          {SOCIAL_PLATFORM_LABELS[item.platform]}
        </a>
      ))}
    </div>
  );
}
