# Runbook Pemulihan Basis Data (OS-OPS-007)

Prosedur ini dipakai saat restore dari `/pengaturan/database` atau saat memulihkan
server setelah insiden. Restore bersifat **destruktif**: seluruh data saat ini
diganti isi berkas dump.

## Sebelum restore

1. Unduh backup terbaru (`.sql` atau `.sql.gz`) dari `/pengaturan/database`.
2. Simpan salinan di lokasi terpisah dari server aplikasi.
3. Catat versi aplikasi dan migrasi terakhir (`src/db/migrations/meta/_journal.json`).
4. Pastikan hanya akun dengan izin `database:delete` yang menjalankan restore.
5. Pastikan ruang disk minimal 2× ukuran basis data.

Batas unggah restore adalah **200 MB** (`MAX_RESTORE_BYTES`). Berkas lain selain
`.sql`/`.sql.gz` ditolak sebelum menyentuh basis data.

## Prosedur restore

1. Buka `/pengaturan/database`, unggah berkas, centang konfirmasi, lalu kirim.
2. Aplikasi menjalankan `mysql` dengan `MYSQL_PWD` dari `DATABASE_URL`, membaca
   dump (membuka gzip bila perlu), lalu memverifikasi tabel inti:
   `users`, `villages`, `roles`, `sessions`, `audit_logs`, `pengaturan_desa`,
   dan `pengguna_shortcut`.
3. Bila verifikasi gagal, restore dianggap tidak lengkap. Jangan lanjutkan
   pemakaian aplikasi; pulihkan backup sebelumnya.
4. Setelah berhasil, catat event audit `database.restore` dan uji halaman
   `/beranda`, `/penduduk`, serta `/desa` (publik).

## Pemulihan manual (bila aplikasi tidak dapat diakses)

```bash
# Linux/macOS
MYSQL_PWD="$DB_PASSWORD" mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "$DB_NAME" < backup.sql

# Windows (Git Bash/PowerShell), pastikan mysql.exe ada di PATH
"$MYSQL_HOME/bin/mysql.exe" -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p "$DB_NAME" < backup.sql
```

Untuk berkas `.sql.gz`:

```bash
gunzip -c backup.sql.gz | MYSQL_PWD="$DB_PASSWORD" mysql -h "$DB_HOST" -u "$DB_USER" "$DB_NAME"
```

## Setelah restore

1. Jalankan `npm run db:migrate` bila dump berasal dari versi aplikasi lebih lama.
2. Verifikasi jumlah tabel: `SHOW TABLES;` minimal memuat tabel inti di atas.
3. Uji login admin, buka daftar penduduk, dan buka beranda publik.
4. Simpan catatan insiden: waktu, berkas, ukuran, durasi, dan hasil verifikasi.
5. Jika restore gagal di tengah jalan, hentikan aplikasi, pulihkan backup
   terakhir, lalu ulangi dengan dump yang sudah diverifikasi.

## Pencegahan

- Jadwalkan backup harian dan simpan di luar server.
- Uji restore ke basis data sementara secara berkala, bukan hanya backup.
- Pantau ukuran dump; pertumbuhan tak wajar dapat menandakan data ganda.
