/**
 * Pilihan tata letak kiosk mengikuti `orientasi_layar` perangkat OpenSID:
 * `1` lanskap (default) dan `0` potret. Perangkat yang belum terverifikasi
 * memakai lanskap, sama seperti default OpenSID.
 */
export interface TataLetakKiosk {
  orientasi: "lanskap" | "potret";
  kelasGrid: string;
  kelasLebar: string;
}

export function tataLetakKiosk(orientasiLayar: number | null | undefined): TataLetakKiosk {
  if (orientasiLayar === 0) {
    return {
      orientasi: "potret",
      kelasGrid: "grid gap-6 sm:grid-cols-2",
      kelasLebar: "max-w-3xl",
    };
  }

  return {
    orientasi: "lanskap",
    kelasGrid: "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    kelasLebar: "max-w-6xl",
  };
}
