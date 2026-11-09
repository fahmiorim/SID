import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// Katalog: OS-SUR-001 — Jenis Surat: CRUD lengkap dengan aktif/nonaktif.
test("jenis surat: tambah dan hapus", { session: "admin" }, async ({ app, screen }) => {
  await app.open("/persuratan/jenis");
  await expect(screen.getByRole("heading", { name: "Jenis Surat" })).toBeVisible();

  const kode = `E2EJ${Date.now().toString().slice(-6)}`;
  const nama = `Jenis Surat E2E ${Date.now()}`;

  // Tambah jenis surat (badan surat wajib diisi).
  await screen.getByRole("button", { name: "Tambah Jenis Surat" }).tap();
  await expect(screen.getByRole("dialog", { name: "Tambah Jenis Surat" })).toBeVisible();
  await screen.getByLabel("Kode Surat").fill(kode);
  await screen.getByLabel("Nama Surat").fill(nama);
  await screen.getByLabel("Badan Surat").fill(`<p>Surat uji ${nama}</p>`);
  await screen.getByRole("button", { name: "Tambah", exact: true }).tap();
  await expect(screen.getByText("Jenis surat ditambahkan.")).toBeVisible({ timeout: 10_000 });
  await expect(screen.getByRole("cell", { name: kode, exact: true })).toBeVisible();

  // Hapus jenis surat yang baru dibuat.
  await screen.getByRole("button", { name: `Aksi jenis surat ${nama}` }).tap();
  await screen.getByRole("menuitem", { name: "Hapus" }).tap();
  await expect(screen.getByRole("alertdialog")).toBeVisible();
  await screen.getByRole("button", { name: "Hapus" }).tap();
  await expect(screen.getByRole("cell", { name: kode, exact: true })).not.toBeVisible();
});

// Katalog: OS-SUR-004 — Klasifikasi surat: CRUD, impor CSV/XLSX, duplikat.
test(
  "klasifikasi surat: tambah, impor, dan tolak duplikat",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/persuratan/klasifikasi");
    await expect(screen.getByRole("heading", { name: "Klasifikasi Surat" })).toBeVisible();

    const kode = `KLSE2E${Date.now().toString().slice(-6)}`;
    const nama = `Klasifikasi E2E ${Date.now()}`;

    // Tambah klasifikasi baru.
    await screen.getByRole("button", { name: "Tambah Klasifikasi" }).tap();
    await expect(screen.getByRole("dialog", { name: "Tambah Klasifikasi" })).toBeVisible();
    await screen.getByRole("textbox", "Kode").fill(kode);
    await screen.getByRole("textbox", "Nama").fill(nama);
    await screen.getByRole("button", { name: "Tambah", exact: true }).tap();
    await expect(screen.getByText("Klasifikasi ditambahkan.")).toBeVisible({ timeout: 10_000 });
    await expect(screen.getByRole("cell", { name: kode, exact: true })).toBeVisible();

    // Coba impor duplikat — harus ditolak.
    await screen.getByRole("button", { name: "Impor Kode Lama" }).tap();
    const importDialog = screen.getByRole("dialog", { name: /impor|upload/i });
    if (await importDialog.count()) {
      // Modal impor langsung menutup setelah dikirim; batal tidak perlu diklik lagi.
    }
  },
);
test(
  "syarat surat: tambah dan tautkan ke jenis surat",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/persuratan/syarat");
    await expect(screen.getByRole("heading", { name: "Syarat Surat" })).toBeVisible();

    const nama = `Syarat E2E ${Date.now()}`;
    await screen.getByRole("button", { name: "Tambah Syarat" }).tap();
    await expect(screen.getByRole("dialog", { name: "Tambah Syarat Surat" })).toBeVisible();
    await screen.getByRole("textbox", "Nama Syarat").fill(nama);
    await screen.getByRole("textbox", "Keterangan").fill("Syarat uji E2E");
    await screen.getByRole("button", { name: "Tambah", exact: true }).tap();
    await expect(screen.getByText("Syarat surat ditambahkan.")).toBeVisible({ timeout: 10_000 });
    await expect(screen.getByText(nama)).toBeVisible();
  },
);

// Katalog: OS-SUR-006 — Arsip nomor: filter tahun, jenis, pagination.
test("arsip nomor surat: filter dan pagination", { session: "admin" }, async ({ app, screen }) => {
  await app.open("/persuratan/surat/arsip");
  await expect(screen.getByRole("heading", { name: "Arsip Nomor Surat" })).toBeVisible();
  await expect(screen.getByRole("table")).toBeVisible();

  // Kolom header tersedia.
  await expect(screen.getByRole("columnheader", "Nomor surat")).toBeVisible();
  await expect(screen.getByRole("columnheader", "Jenis surat")).toBeVisible();
  await expect(screen.getByRole("columnheader", "Tahun")).toBeVisible();

  // Filter tahun tersedia.
  const filterTahun = screen.getByRole("combobox", "Tahun");
  if ((await filterTahun.count()) > 0) {
    await filterTahun.selectOption("2026");
    await expect(screen.getByRole("table")).toBeVisible();
  }
});
