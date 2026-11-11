"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Menampilkan anak hanya pada viewport di bawah `md` (768 px).
 *
 * Tabel admin tetap menjadi markup utama untuk desktop; kartu mobile tidak
 * dirender sama sekali di desktop agar locator aksesibilitas/E2E tidak melihat
 * dua salinan teks yang sama. Di mobile kartu muncul setelah hidrasi.
 */
export function MobileOnly({ children }: { children: ReactNode }) {
  const [tampil, setTampil] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const sinkron = () => setTampil(media.matches);
    sinkron();
    media.addEventListener("change", sinkron);
    return () => media.removeEventListener("change", sinkron);
  }, []);

  return tampil ? <>{children}</> : null;
}
