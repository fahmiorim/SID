# Drizzle ORM — Skema Aplikasi Desa (rebuild OpenSID)

Skema Drizzle untuk **MySQL 8 / MariaDB**, mengikuti strategi **Opsi A (Kompatibel)** dari
[LAMPIRAN-04](../LAMPIRAN-04-MAPPING-MIGRASI-P0.md):

- Nama tabel & kolom legacy **dipertahankan** (`tweb_penduduk`, `id_kk`, `sex`, …)
- **ID numerik & kode enum** lama dipertahankan
- Tipe dinaikkan seperlunya + kolom audit (`created_at`, `updated_at`, `deleted_at`)

## Isi Berkas

| Berkas | Isi |
|---|---|
| `schema.ts` | Definisi tabel + relasi (Drizzle) |
| `../migration/p0-import.sql` | Impor data P0 dari DB OpenSID lama |
| `../openapi.yaml` | Kontrak REST API (OpenAPI 3.1.0) |

## Setup

```bash
npm i drizzle-orm mysql2
npm i -D drizzle-kit
```

`drizzle.config.ts`:

```ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'mysql',
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```

Koneksi (contoh):

```ts
// db/index.ts
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema';

const pool = mysql.createPool(process.env.DATABASE_URL!);
export const db = drizzle(pool, { schema, mode: 'default' });
```

Generate & jalankan migrasi:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

## Urutan Impor Data (FK-safe)

Lihat [migration/p0-import.sql](../migration/p0-import.sql). Ringkas:

```
config → user_grup → setting_modul → grup_akses → user → setting_aplikasi
→ ref_* → tweb_wil_clusterdesa → tweb_keluarga → tweb_penduduk
→ tweb_desa_pamong → ref_syarat_surat → tweb_surat_format → urls
→ klasifikasi_surat/lampiran_surat → log_penduduk → log_keluarga
→ log_surat → permohonan_surat → surat_masuk/surat_keluar
```

> Untuk >1 desa: jalankan per `config_id` (skrip didesain untuk satu tenant per run).

## Pemetaan Permission (RBAC)

Nilai `grup_akses.akses` dipertahankan **1/3/7** (OpenSID). Helper turunan:

```ts
export const can = {
  read:   (a: number) => (a & 1) === 1,           // 1,3,7
  update: (a: number) => (a & 3) === 3,           // 3,7
  delete: (a: number) => a === 7,                 // 7
};
```

Aturan **pewarisan modul induk**: jika salah satu anak modul memiliki `akses > 0`, maka
modul induk ikut ditampilkan — terapkan saat membangun pohon menu (lihat LAMPIRAN-02).

Scoping wilayah (`user.batasi_wilayah` + `user.akses_wilayah` JSON): filter query
`id_cluster IN (:akses_wilayah)` bila `batasi_wilayah = 1`.

## Password

Hash lama (MD5) **tidak kompatibel**. Impor meng-NULL-kan `password_hash` dan
menyetel `must_reset_password = 1`. Gunakan **better-auth** (bcrypt/argon2) untuk
kredensial baru.

## Catatan

- Skema ini mencakup **modul P0**; tabel lain (±260 total, lihat
  [LAMPIRAN-05](../LAMPIRAN-05-ERD-LENGKAP.md)) ditambahkan bertahap.
- `syarat_surat` pada `tweb_surat_format` adalah **JSON array** `ref_syarat_id`
  (tidak ada tabel pivot).
- Kode enum numerik didokumentasikan di
  [LAMPIRAN-03](../LAMPIRAN-03-ENUM-REFERENSI.md).
