"use client";

/** Tombol cetak browser untuk halaman tema publik (harus komponen klien). */
export function ThemePrintButton({ label = "Cetak" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="tema-button-primary inline-flex items-center gap-2 px-4 py-2 text-sm font-medium"
    >
      {label}
    </button>
  );
}
