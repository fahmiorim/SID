"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ANJUNGAN_UUID_COOKIE, bacaAtauBuatUuidPerangkat } from "../device-uuid";

function bacaCookie(nama: string): string | null {
  const baris = document.cookie.split("; ");
  for (const item of baris) {
    const [kunci, ...sisa] = item.split("=");
    if (kunci === nama) return decodeURIComponent(sisa.join("="));
  }
  return null;
}

/**
 * Mengenali browser sebagai perangkat kiosk: UUID disimpan di localStorage
 * (seperti klien anjungan OpenSID) lalu dicerminkan ke cookie agar server dapat
 * memverifikasinya. Halaman dimuat ulang sekali saat UUID baru dipasang.
 */
export function AnjunganDeviceId() {
  const router = useRouter();

  useEffect(() => {
    let uuid: string;
    let baru: boolean;
    try {
      const hasil = bacaAtauBuatUuidPerangkat(window.localStorage, () => crypto.randomUUID());
      uuid = hasil.uuid;
      baru = hasil.baru;
    } catch {
      // Penyimpanan browser diblokir (mode privat/penyimpanan penuh).
      return;
    }

    const cookieSama = bacaCookie(ANJUNGAN_UUID_COOKIE) === uuid;
    if (!cookieSama) {
      document.cookie = `${ANJUNGAN_UUID_COOKIE}=${encodeURIComponent(uuid)}; path=/; max-age=31536000; samesite=lax`;
    }

    if (baru || !cookieSama) router.refresh();
  }, [router]);

  return null;
}
