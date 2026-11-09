"use client";

import dynamic from "next/dynamic";

import type { PetaMapProps } from "./peta-map";

/**
 * Pembungkus Leaflet dengan `ssr: false`.
 *
 * `leaflet` menyentuh `window` saat modul dievaluasi. Tanpa pemisahan ini,
 * halaman `/desa/peta` yang dirender server akan melempar
 * `ReferenceError: window is not defined` walau peta akhirnya tampil di klien.
 */
const PetaMap = dynamic(() => import("./peta-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] w-full items-center justify-center rounded-lg border text-sm text-muted-foreground">
      Memuat peta…
    </div>
  ),
});

export default function PetaMapClient(props: PetaMapProps) {
  return <PetaMap {...props} />;
}
