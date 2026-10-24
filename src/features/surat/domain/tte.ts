/**
 * Adapter Tanda Tangan Elektronik (TTE) / BSRE — Fase 2E.
 *
 * OpenSID memanggil server BSRE (`api/sign/pdf`) setelah verifikasi Kepala
 * Desa untuk menimpa berkas PDF surat dengan hasil tanda tangan elektronik.
 * Meniru perilaku itu butuh kredensial penyedia sertifikat yang belum
 * tersedia, sehingga di sini diberi **scaffolding dengan mode nonaktif**:
 *
 * - mode `nonaktif` (default): tidak ada jaringan, surat terbit tanpa TTE;
 * - mode `bsre`: kredensial parsial atau penuh tetap ditampung agar adapter
 *   asli dapat ditambahkan tanpa mengubah pemanggil.
 *
 * Semua fungsi di sini murni (tanpa I/O) dan dapat diuji tanpa basis data.
 * Pemanggil (`terbitkanSurat`) wajib memperlakukan hasil `ok: false` sebagai
 * bukan kegagalan penerbitan — surat tetap terbit tanpa TTE.
 */

/** Mode adapter yang dikenal. `manual` menandai surat setelah ttd basah. */
export type ModeTte = "nonaktif" | "manual" | "bsre";

export interface KonfigTte {
  mode: ModeTte;
  /** Base URL server BSRE, mis. `https://tte.example.go.id`. */
  api: string;
  username: string;
  /** Passphrase/kredensial — jangan pernah dicetak ke log. */
  password: string;
  /** `false` untuk melewatkan verifikasi sertifikat TLS (demo/openluk). */
  ssl: boolean;
}

export interface PermintaanTte {
  villageId: number;
  suratId: number;
  /** Nomor surat, untuk metadata arsip hasil TTE. */
  nomor: string;
  /** Berkas PDF yang akan ditandatangani. */
  pdf: Uint8Array;
}

/** Hasil percobaan TTE; `ok: false` tidak memblokir penerbitan surat. */
export type HasilTte =
  { ok: true; mode: "bsre"; suratId: number } | { ok: false; mode: ModeTte; alasan: string };

/** Konfigurasi TTE tidak lengkap untuk mode bsre. */
export function siapTte(config: KonfigTte): boolean {
  return (
    config.mode === "bsre" && config.api !== "" && config.username !== "" && config.password !== ""
  );
}

/**
 * Baca konfigurasi TTE dari lingkungan (variabel `TTE_*`). Nilai tak dikenal
 * jatuh aman ke mode `nonaktif` — penerbitan surat tidak pernah gagal karena
 * salah ketik konfigurasi.
 */
export function parseKonfigTte(env: Readonly<Record<string, string | undefined>>): KonfigTte {
  const modeRaw = (env.TTE_MODE ?? "").trim().toLowerCase();
  const mode: ModeTte =
    modeRaw === "bsre" || modeRaw === "manual" ? (modeRaw as ModeTte) : "nonaktif";

  return {
    mode,
    api: (env.TTE_API ?? "").trim(),
    username: (env.TTE_USERNAME ?? "").trim(),
    password: env.TTE_PASSWORD ?? "",
    ssl: (env.TTE_SSL ?? "true").trim().toLowerCase() !== "false",
  };
}

/**
 * Klien BSRE: menandatangani PDF melalui `POST api/sign/pdf`.
 *
 * Sengaja diimplementasi sebagai `null` — adapter asli (Fase berikutnya)
 * menggantikan nilai ini dengan fungsi jaringan; signature cocok agar cukup
 * ditukar tanpa menyentuh pemanggil.
 */
export type KlienTte =
  ((permintaan: PermintaanTte, config: KonfigTte) => Promise<Uint8Array>) | null;

/**
 * Coba tandai surat secara elektronik.
 *
 * Mode `manual` bukan tindakan adapter: surat ditandai setelah Kepala Desa
 * tanda tangan basah (di luar modul ini). Mengembalikan `ok: false` dengan
 * penjelasan; pemanggil mencatat hasilnya tanpa menggagalkan penerbitan.
 */
export function tandaiTte(
  config: KonfigTte,
  permintaan: PermintaanTte,
  klien: KlienTte,
): Promise<HasilTte> {
  if (config.mode === "manual") {
    return Promise.resolve({
      ok: false,
      mode: "manual",
      alasan: "TTE manual: surat ditandai setelah tanda tangan basah Kepala Desa.",
    });
  }

  if (config.mode !== "bsre" || !siapTte(config) || klien === null) {
    return Promise.resolve({
      ok: false,
      mode: config.mode,
      alasan: "TTE dinonaktifkan — surat diterbitkan tanpa tanda tangan elektronik.",
    });
  }

  // Mode bsre lengkap: adapter jaringan belum diimplementasi (Fase 2E-
  // nonaktif). Kegagalan di sini tidak memblokir penerbitan.
  return Promise.resolve({
    ok: false,
    mode: "bsre",
    alasan: "Adapter BSRE belum diimplementasi; konfigurasi tersimpan.",
  });
}
