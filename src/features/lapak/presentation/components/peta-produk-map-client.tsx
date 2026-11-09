"use client";

import dynamic from "next/dynamic";

/**
 * Pembungkus klien untuk peta produk.
 *
 * `leaflet` menyentuh `window` saat modul dievaluasi, sehingga komponen peta
 * tidak boleh dirender di server. Tanpa pemisahan ini halaman
 * `/desa/lapak/peta` gagal dimuat (`ReferenceError: window is not defined`).
 */
const PetaProdukMap = dynamic(() => import("./peta-produk-map"), {
  ssr: false,
  loading: () => <div className="h-[500px] w-full animate-pulse rounded-lg border bg-muted" />,
});

export default PetaProdukMap;
