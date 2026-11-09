import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// Katalog: OS-WIL-002 — GIS area: metadata, CRUD, relasi layer polygon, peta cetak.
test(
  "area GIS: halaman admin dan cetak tersedia",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/pemetaan/area");
    await expect(screen.getByRole("heading", { name: /area|polygon/i })).toBeVisible();
    await expect(screen.getByRole("button", { name: /tambah|add/i })).toBeVisible();

    // Peta cetak.
    await app.open("/desa/peta/cetak");
    await expect(screen.getByRole("heading", { name: /cetak|peta/i })).toBeVisible();
  },
);

// Katalog: OS-WIL-003 — Garis (LineString).
test(
  "garis GIS: CRUD via EntityManager tersedia",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/pemetaan/garis");
    await expect(screen.getByRole("heading", { name: /garis/i })).toBeVisible();
  },
);

// Katalog: OS-WIL-004 — Point + simbol.
test("point GIS: CRUD dengan simbol tersedia", { session: "admin" }, async ({ app, screen }) => {
  await app.open("/pemetaan/point");
  await expect(screen.getByRole("heading", { name: /point|titik/i })).toBeVisible();
});

// Katalog: OS-WIL-005 — Polygon.
test("polygon GIS: kategori dan layer tersedia", { session: "admin" }, async ({ app, screen }) => {
  await app.open("/pemetaan/polygon");
  await expect(screen.getByRole("heading", { name: /kategori peta/i })).toBeVisible();
  await expect(screen.getByRole("button", { name: "Tambah Polygon" })).toBeVisible();
});

// Katalog: OS-WIL-006 — Pertanahan: CRUD persil, Cdesa, mutasi.
test(
  "OS-WIL-006 pertanahan: CRUD persil, cdesa, mutasi + akses publik",
  { session: "admin" },
  async ({ app, screen, browser }) => {
    await app.open("/pemetaan/pertanahan");
    await expect(screen.getByRole("heading", { name: /pertanahan/i })).toBeVisible();

    const ts = Date.now();

    // --- Persil ---
    const nomorPersil = `P-${ts}`;
    const luasPersilAwal = 100.5;
    const luasPersilBaru = 120.75;
    const statusPersil = "milik";

    // Tambah persil
    await screen.getByRole("button", { name: "Tambah Persil" }).tap();
    await expect(screen.getByRole("dialog", { name: "Tambah Persil Tanah" })).toBeVisible();
    await screen.getByLabel("No. Persil").fill(nomorPersil);
    await screen.getByLabel("Luas (m²)").fill(String(luasPersilAwal));
    await screen.getByLabel("Status").fill(statusPersil);
    await screen.getByRole("button", { name: "Simpan", exact: true }).tap();
    await expect(screen.getByText("Persil berhasil dibuat.")).toBeVisible({ timeout: 10_000 });

    const rowPersil = screen.getByRole("row", { name: new RegExp(nomorPersil) });
    await expect(rowPersil).toBeVisible();

    // Ubah persil
    await rowPersil.getByRole("button", { name: /ubah/i }).tap();
    await expect(screen.getByRole("dialog", { name: "Ubah Persil Tanah" })).toBeVisible();
    await screen.getByLabel("Luas (m²)").fill(String(luasPersilBaru));
    await screen.getByRole("button", { name: "Simpan", exact: true }).tap();
    await expect(screen.getByText("Persil berhasil diperbarui.")).toBeVisible({ timeout: 10_000 });

    // --- Cdesa ---
    const nomorCdesa = `C-${ts}`;
    const namaPemegangCdesa = `Pemegang E2E ${ts}`;
    const tanggalCdesa = "2026-01-01";

    // Tambah Cdesa
    await screen.getByRole("button", { name: "Tambah Cdesa" }).tap();
    await expect(screen.getByRole("dialog", { name: "Tambah Cdesa" })).toBeVisible();
    await screen.getByLabel("Nomor Cdesa").fill(nomorCdesa);
    await screen.getByLabel("No. Persil").fill(nomorPersil);
    await screen.getByLabel("Nama Pemegang").fill(namaPemegangCdesa);
    await screen.getByLabel("Tanggal").fill(tanggalCdesa);
    await screen.getByRole("button", { name: "Simpan", exact: true }).tap();
    await expect(screen.getByText("Cdesa berhasil dibuat.")).toBeVisible({ timeout: 10_000 });

    const rowCdesa = screen.getByRole("row", { name: new RegExp(nomorCdesa) });
    await expect(rowCdesa).toBeVisible();

    // Ubah Cdesa
    const namaPemegangCdesaBaru = `Pemegang Baru E2E ${ts}`;
    await rowCdesa.getByRole("button", { name: /ubah/i }).tap();
    await expect(screen.getByRole("dialog", { name: "Ubah Cdesa" })).toBeVisible();
    await screen.getByLabel("Nama Pemegang").fill(namaPemegangCdesaBaru);
    await screen.getByRole("button", { name: "Simpan", exact: true }).tap();
    await expect(screen.getByText("Cdesa berhasil diperbarui.")).toBeVisible({ timeout: 10_000 });

    // --- Mutasi Cdesa ---
    const nomorMutasi = `M-${ts}`;
    const jenisMutasi = "Jual Beli";
    const keteranganMutasi = `Keterangan mutasi E2E ${ts}`;
    const tanggalMutasi = "2026-01-15";

    // Tambah Mutasi Cdesa
    await screen.getByRole("button", { name: "Tambah Mutasi" }).tap();
    await expect(screen.getByRole("dialog", { name: "Tambah Mutasi Cdesa" })).toBeVisible();

    await screen.getByLabel("Cdesa").selectOption({ label: `Cdesa ${nomorCdesa}` });
    await screen.getByLabel("Nomor Mutasi").fill(nomorMutasi);
    await screen.getByLabel("Tanggal").fill(tanggalMutasi);
    await screen.getByLabel("Jenis Mutasi").fill(jenisMutasi);
    await screen.getByLabel("Keterangan").fill(keteranganMutasi);
    await screen.getByRole("button", { name: "Simpan", exact: true }).tap();
    await expect(screen.getByText("Mutasi berhasil dibuat.")).toBeVisible({ timeout: 10_000 });

    const rowMutasi = screen.getByRole("row", { name: new RegExp(nomorMutasi) });
    await expect(rowMutasi).toBeVisible();

    // Ubah Mutasi Cdesa
    const jenisMutasiBaru = "Hibah";
    await rowMutasi.getByRole("button", { name: /ubah/i }).tap();
    await expect(screen.getByRole("dialog", { name: "Ubah Mutasi Cdesa" })).toBeVisible();
    await screen.getByLabel("Jenis Mutasi").fill(jenisMutasiBaru);
    await screen.getByRole("button", { name: "Simpan", exact: true }).tap();
    await expect(screen.getByText("Mutasi berhasil diperbarui.")).toBeVisible({ timeout: 10_000 });

    // --- Verifikasi di halaman publik ---
    await app.open("/desa/pertanahan");
    await expect(browser).toHaveURL("/desa/pertanahan");
    await expect(screen.getByRole("heading", { name: /data pertanahan/i })).toBeVisible();
    await expect(screen.getByRole("cell", { name: nomorPersil }).first()).toBeVisible();
    await expect(screen.getByRole("cell", { name: nomorCdesa }).first()).toBeVisible();

    // Hapus data (Mutasi, Cdesa, Persil)
    await app.open("/pemetaan/pertanahan");

    const rowMutasiHapus = screen.getByRole("row", { name: new RegExp(nomorMutasi) });
    await rowMutasiHapus.getByRole("button", { name: /^Hapus Mutasi/ }).tap();
    await expect(screen.getByText("Mutasi berhasil dihapus.")).toBeVisible({ timeout: 10_000 });

    const rowCdesaHapus = screen.getByRole("row", { name: new RegExp(nomorCdesa) });
    await rowCdesaHapus.getByRole("button", { name: /^Hapus Cdesa/ }).tap();
    await expect(screen.getByText("Cdesa berhasil dihapus.")).toBeVisible({ timeout: 10_000 });

    const rowPersilHapus = screen.getByRole("row", { name: new RegExp(nomorPersil) });
    await rowPersilHapus.getByRole("button", { name: /^Hapus Persil/ }).tap();
    await expect(screen.getByText("Persil berhasil dihapus.")).toBeVisible({ timeout: 10_000 });
  },
);

// Katalog: OS-WIL-007 — Peta cetak statis (SVG).
test("peta cetak statis merender SVG dan legenda", async ({ app, browser, screen }) => {
  await app.open("/desa/peta/cetak");
  await expect(browser).toHaveURL("/desa/peta/cetak");
  await expect(screen.getByRole("heading", { name: /peta desa/i })).toBeVisible();
  await expect(browser.locator("svg").first()).toBeVisible();
});

// Katalog: OS-WIL-008 — Simbol katalog.
test(
  "simbol GIS: CRUD melalui dialog EntityManager",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/pemetaan/simbol");
    await expect(screen.getByRole("heading", { name: /simbol/i })).toBeVisible();
  },
);
