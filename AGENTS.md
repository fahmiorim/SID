<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Sumber Kebenaran Dokumentasi

Sebelum mengerjakan fitur, baca [`docs/README.md`](docs/README.md). Urutan acuan:

1. [`docs/RENCANA-PERBAIKAN.md`](docs/RENCANA-PERBAIKAN.md) — fase, prioritas, status milestone.
2. [`docs/PARITAS-OPENSID.md`](docs/PARITAS-OPENSID.md) — status paritas fitur vs OpenSID.
3. [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — konvensi lapisan, skema, RBAC.

Aturan:

- **Jangan** memakai dokumen di `docs/arsip/` atau klaim "selesai" di komentar lama
  untuk menentukan status fitur. Dokumen arsip hanya jejak historis.
- Klaim fitur "selesai" harus punya bukti: halaman/action yang terpakai + test.
  Domain/action tanpa UI belum dianggap selesai.
- Setelah mengubah perilaku fitur, perbarui `RENCANA-PERBAIKAN.md` dan/atau
  `PARITAS-OPENSID.md` pada PR yang sama.
- OpenSID (`D:\laragon\www\opensid`) adalah **acuan perilaku**, bukan sumber kode.
  Lisensinya GPL v3 — jangan menyalin kode/aset; implementasi harus orisinal.
- `villageId` halaman publik berasal dari **host**, halaman admin dari **sesi**.
  Jangan menerima `villageId` dari input klien.
- Sebelum commit: `npm run lint`, `npm run format:check`, `npm run test`,
  `npm run check`, dan `npm run build`.
