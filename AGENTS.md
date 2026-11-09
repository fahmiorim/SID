<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Dokumentasi kerja

Sebelum mengerjakan fitur, baca [`docs/README.md`](docs/README.md), lalu:

1. [`docs/CAKUPAN-OPENSID.md`](docs/CAKUPAN-OPENSID.md) — target dan pengecualian yang disepakati.
2. [`docs/STATUS-MODUL.md`](docs/STATUS-MODUL.md) — bukti struktur/kode yang diketahui dan batas audit.
3. [`docs/RENCANA-PENGEMBANGAN.md`](docs/RENCANA-PENGEMBANGAN.md) — tahap audit, perbaikan, dan pengujian.
4. [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — konvensi lapisan, skema, RBAC, dan quality gate.

Aturan:

- **Jangan** memakai dokumen di `docs/arsip/` atau klaim "selesai" di komentar lama
  untuk menentukan status fitur. Dokumen arsip hanya jejak historis.
- Klaim fitur "selesai" harus punya bukti: halaman/action yang terpakai, izin
  dan scoping tenant, serta test perilaku yang relevan. Keberadaan route atau
  test smoke saja tidak cukup.
- Setiap perubahan perilaku fitur wajib memperbarui bukti/status di
  `docs/STATUS-MODUL.md` dan langkah berikutnya di
  `docs/RENCANA-PENGEMBANGAN.md` bila relevan. Gunakan ID katalog lama sebagai
  referensi historis, bukan asumsi inventaris lengkap.
- OpenSID (`D:/laragon/www/opensid`) adalah **acuan perilaku**, bukan
  sumber kode. Lisensinya GPL v3 — jangan menyalin kode/aset; implementasi
  harus orisinal.
- `villageId` halaman publik berasal dari **host**, halaman admin dari **sesi**.
  Jangan menerima `villageId` dari input klien.
- Sebelum commit: `npm run lint`, `npm run format:check`, `npm run test`,
  `npm run check`, dan `npm run build`.
