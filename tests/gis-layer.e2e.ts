import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// ============================================================================
// OS-WIL-003 — Garis (LineString) CRUD via EntityManager
// ============================================================================
test(
  "OS-WIL-003 garis: tambah LineString, tampil di tabel, ubah field, hapus",
  { session: "admin", tags: ["smoke"] },
  async ({ app, screen }) => {
    await app.open("/pemetaan/garis");
    await expect(screen.getByRole("heading", { name: /garis peta/i })).toBeVisible();
    await expect(screen.getByRole("button", { name: "Tambah Garis" })).toBeVisible();

    const ts = Date.now();
    const namaGaris = `Jalan E2E ${ts}`;
    const deskAwal = "Deskripsi awal garis";
    const deskBaru = "Deskripsi diubah E2E";

    // Tambah garis
    await screen.getByRole("button", { name: "Tambah Garis" }).tap();
    await expect(screen.getByRole("dialog", { name: "Tambah Garis Peta" })).toBeVisible();

    await screen.getByLabel("Nama Garis").fill(namaGaris);
    await screen
      .getByLabel("Path GeoJSON (LineString)")
      .fill('{"type":"LineString","coordinates":[[110.4,-7.2],[110.5,-7.3]]}');
    await screen.getByLabel("Keterangan").fill(deskAwal);
    await screen.getByRole("button", { name: "Simpan", exact: true }).tap();

    // Verifikasi notifikasi sukses + baris muncul di tabel
    await expect(screen.getByText("Garis berhasil dibuat.")).toBeVisible({ timeout: 10_000 });
    const rowGaris = screen.getByRole("row", { name: new RegExp(namaGaris) });
    await expect(rowGaris).toBeVisible({ timeout: 10_000 });
    await expect(rowGaris.getByText(deskAwal)).toBeVisible();

    // Ubah satu field (keterangan)
    await rowGaris.getByRole("button", { name: /ubah/i }).tap();
    await expect(screen.getByRole("dialog", { name: "Ubah Garis Peta" })).toBeVisible();
    await screen.getByLabel("Keterangan").fill(deskBaru);
    await screen.getByRole("button", { name: "Simpan", exact: true }).tap();

    await expect(screen.getByText("Garis berhasil diperbarui.")).toBeVisible({ timeout: 10_000 });
    await expect(rowGaris.getByText(deskBaru)).toBeVisible({ timeout: 10_000 });

    // Hapus garis — EntityManager menghapus tanpa dialog konfirmasi
    await rowGaris.getByRole("button", { name: /hapus/i }).tap();
    await expect(screen.getByText("Garis berhasil dihapus.")).toBeVisible({ timeout: 10_000 });
    await expect(screen.getByRole("row", { name: new RegExp(namaGaris) })).not.toBeVisible({
      timeout: 10_000,
    });
  },
);

// ============================================================================
// OS-WIL-004 — Point (Point + simbol) CRUD via EntityManager
// ============================================================================
test(
  "OS-WIL-004 point: tambah Point dengan simbol, tampil di tabel, ubah field, hapus",
  { session: "admin", tags: ["smoke"] },
  async ({ app, screen }) => {
    await app.open("/pemetaan/point");
    await expect(screen.getByRole("heading", { name: /titik peta/i })).toBeVisible();
    await expect(screen.getByRole("button", { name: "Tambah Titik" })).toBeVisible();

    const ts = Date.now();
    const namaPoint = `Titik E2E ${ts}`;
    const tipeAwal = "1";
    const tipeBaru = "2";

    // Tambah point
    await screen.getByRole("button", { name: "Tambah Titik" }).tap();
    await expect(screen.getByRole("dialog", { name: "Tambah Titik Peta" })).toBeVisible();

    await screen.getByLabel("Nama Titik").fill(namaPoint);
    await screen
      .getByLabel("Path GeoJSON (Point)")
      .fill('{"type":"Point","coordinates":[110.45,-7.25]}');
    await screen.getByLabel("Tipe").fill(tipeAwal);
    await screen.getByRole("button", { name: "Simpan", exact: true }).tap();

    // Verifikasi notifikasi sukses + baris muncul di tabel
    await expect(screen.getByText("Titik berhasil dibuat.")).toBeVisible({ timeout: 10_000 });
    const rowPoint = screen.getByRole("row", { name: new RegExp(namaPoint) });
    await expect(rowPoint).toBeVisible({ timeout: 10_000 });
    await expect(rowPoint.getByText(tipeAwal)).toBeVisible();

    // Ubah satu field (tipe)
    await rowPoint.getByRole("button", { name: /ubah/i }).tap();
    await expect(screen.getByRole("dialog", { name: "Ubah Titik Peta" })).toBeVisible();
    await screen.getByLabel("Tipe").fill(tipeBaru);
    await screen.getByRole("button", { name: "Simpan", exact: true }).tap();

    await expect(screen.getByText("Titik berhasil diperbarui.")).toBeVisible({ timeout: 10_000 });
    await expect(rowPoint.getByText(tipeBaru)).toBeVisible({ timeout: 10_000 });

    // Hapus point — EntityManager menghapus tanpa dialog konfirmasi
    await rowPoint.getByRole("button", { name: /hapus/i }).tap();
    await expect(screen.getByText("Titik berhasil dihapus.")).toBeVisible({ timeout: 10_000 });
    await expect(screen.getByRole("row", { name: new RegExp(namaPoint) })).not.toBeVisible({
      timeout: 10_000,
    });
  },
);

// ============================================================================
// OS-WIL-005 — Polygon (layer polygon) CRUD via EntityManager
// ============================================================================
test(
  "OS-WIL-005 polygon: tambah layer polygon, tampil di tabel, ubah field, hapus",
  { session: "admin", tags: ["smoke"] },
  async ({ app, screen }) => {
    await app.open("/pemetaan/polygon");
    await expect(screen.getByRole("heading", { name: /kategori peta/i })).toBeVisible();
    await expect(screen.getByRole("button", { name: "Tambah Polygon" })).toBeVisible();

    const ts = Date.now();
    const namaPolygon = `Layer E2E ${ts}`;
    const warnaAwal = "#ff0000";
    const warnaBaru = "#00ff00";

    // Tambah polygon layer
    await screen.getByRole("button", { name: "Tambah Polygon" }).tap();
    await expect(screen.getByRole("dialog", { name: "Tambah Kategori Peta" })).toBeVisible();

    await screen.getByLabel("Nama Polygon").fill(namaPolygon);
    await screen.getByLabel("Warna (HEX)").fill(warnaAwal);
    await screen.getByLabel("Tipe").selectOption({ label: "Root / Layer Utama" });
    await screen.getByRole("button", { name: "Simpan", exact: true }).tap();

    // Verifikasi notifikasi sukses + baris muncul di tabel
    await expect(screen.getByText("Polygon berhasil dibuat.")).toBeVisible({ timeout: 10_000 });
    const rowPolygon = screen.getByRole("row", { name: new RegExp(namaPolygon) });
    await expect(rowPolygon).toBeVisible({ timeout: 10_000 });
    await expect(rowPolygon.getByText(warnaAwal)).toBeVisible();

    // Ubah satu field (warna)
    await rowPolygon.getByRole("button", { name: /ubah/i }).tap();
    await expect(screen.getByRole("dialog", { name: "Ubah Kategori Peta" })).toBeVisible();
    await screen.getByLabel("Warna (HEX)").fill(warnaBaru);
    await screen.getByRole("button", { name: "Simpan", exact: true }).tap();

    await expect(screen.getByText("Polygon berhasil diperbarui.")).toBeVisible({ timeout: 10_000 });
    await expect(rowPolygon.getByText(warnaBaru)).toBeVisible({ timeout: 10_000 });

    // Hapus polygon — EntityManager menghapus tanpa dialog konfirmasi
    await rowPolygon.getByRole("button", { name: /hapus/i }).tap();
    await expect(screen.getByText("Polygon berhasil dihapus.")).toBeVisible({ timeout: 10_000 });
    await expect(screen.getByRole("row", { name: new RegExp(namaPolygon) })).not.toBeVisible({
      timeout: 10_000,
    });
  },
);

// ============================================================================
// OS-WIL-008 — Simbol katalog CRUD via EntityManager
// ============================================================================
test(
  "OS-WIL-008 simbol: tambah simbol, tampil di tabel, ubah field, hapus",
  { session: "admin", tags: ["smoke"] },
  async ({ app, screen }) => {
    await app.open("/pemetaan/simbol");
    await expect(screen.getByRole("heading", { name: /simbol peta/i })).toBeVisible();
    await expect(screen.getByRole("button", { name: "Tambah Simbol" })).toBeVisible();

    const ts = Date.now();
    const namaSimbol = `SimbolE2E${ts}`;
    const deskAwal = "Deskripsi simbol awal";
    const deskBaru = "Deskripsi simbol diubah";

    // Tambah simbol
    await screen.getByRole("button", { name: "Tambah Simbol" }).tap();
    await expect(screen.getByRole("dialog", { name: "Tambah Simbol Peta" })).toBeVisible();

    await screen.getByLabel("Nama Simbol").fill(namaSimbol);
    await screen.getByLabel("Keterangan").fill(deskAwal);
    await screen.getByRole("button", { name: "Simpan", exact: true }).tap();

    // Verifikasi notifikasi sukses + baris muncul di tabel
    await expect(screen.getByText("Simbol berhasil dibuat.")).toBeVisible({ timeout: 10_000 });
    const rowSimbol = screen.getByRole("row", { name: new RegExp(namaSimbol) });
    await expect(rowSimbol).toBeVisible({ timeout: 10_000 });
    await expect(rowSimbol.getByText(deskAwal)).toBeVisible();

    // Ubah satu field (keterangan)
    await rowSimbol.getByRole("button", { name: /ubah/i }).tap();
    await expect(screen.getByRole("dialog", { name: "Ubah Simbol Peta" })).toBeVisible();
    await screen.getByLabel("Keterangan").fill(deskBaru);
    await screen.getByRole("button", { name: "Simpan", exact: true }).tap();

    await expect(screen.getByText("Simbol berhasil diperbarui.")).toBeVisible({ timeout: 10_000 });
    await expect(rowSimbol.getByText(deskBaru)).toBeVisible({ timeout: 10_000 });

    // Hapus simbol — EntityManager menghapus tanpa dialog konfirmasi
    await rowSimbol.getByRole("button", { name: /hapus/i }).tap();
    await expect(screen.getByText("Simbol berhasil dihapus.")).toBeVisible({ timeout: 10_000 });
    await expect(screen.getByRole("row", { name: new RegExp(namaSimbol) })).not.toBeVisible({
      timeout: 10_000,
    });
  },
);
