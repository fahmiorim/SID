import type { ReactNode } from "react";

/** Judul halaman + deskripsi + area aksi (kanan). */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-start justify-between gap-4 border-b border-black/[0.05] pb-5">
      <div className="min-w-0 space-y-1.5">
        <h1
          className="text-2xl font-bold tracking-[-0.03em] sm:text-[1.75rem]"
          style={{ textWrap: "balance" }}
        >
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
