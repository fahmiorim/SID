/**
 * Pembatas permintaan sederhana (sliding window) untuk API publik.
 *
 * Disimpan di memori proses; cukup untuk menahan penyalahgunaan dasar pada
 * satu instans. Bila aplikasi berjalan di banyak instans, ganti penyimpanan
 * dengan Redis tanpa mengubah pemanggil.
 */
const catatan = new Map<string, number[]>();

export interface HasilBatasPermintaan {
  /** `true` bila permintaan melewati batas dan harus ditolak. */
  dibatasi: boolean;
  /** Sisa kuota pada jendela berjalan. */
  sisa: number;
  /** Sisa waktu (ms) sampai jendela bergulir. */
  resetMs: number;
}

export interface OpsiBatasPermintaan {
  /** Jumlah maksimum permintaan per jendela. */
  batas?: number;
  /** Panjang jendela dalam milidetik. */
  jendelaMs?: number;
  /** Waktu acuan; dapat diinjeksi pada test. */
  sekarang?: number;
}

/** Catat satu permintaan dan tentukan apakah masih dalam kuota. */
export function batasiPermintaan(
  kunci: string,
  opsi: OpsiBatasPermintaan = {},
): HasilBatasPermintaan {
  const batas = opsi.batas ?? 60;
  const jendelaMs = opsi.jendelaMs ?? 60_000;
  const sekarang = opsi.sekarang ?? Date.now();

  const aktif = (catatan.get(kunci) ?? []).filter((waktu) => sekarang - waktu < jendelaMs);
  const resetMs = jendelaMs;

  if (aktif.length >= batas) {
    catatan.set(kunci, aktif);
    return { dibatasi: true, sisa: 0, resetMs };
  }

  aktif.push(sekarang);
  catatan.set(kunci, aktif);
  return { dibatasi: false, sisa: batas - aktif.length, resetMs };
}

/** Kosongkan seluruh catatan (dipakai test). */
export function resetBatasPermintaan(): void {
  catatan.clear();
}
