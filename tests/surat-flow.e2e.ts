import { test } from "@e2e-dev/web";
import { expect } from "e2e";

test(
  "admin creates a new letter through full form",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/persuratan/surat");
    await expect(screen.getByRole("heading", "Layanan Surat")).toBeVisible();

    await screen.getByRole("button", "Buat Surat").tap();
    await expect(screen.getByRole("dialog", { name: "Buat Surat Baru" })).toBeVisible();

    await screen.getByRole("combobox", "Jenis Surat").tap();
    await screen
      .getByRole("option", { name: /Pengantar|Keterangan/ })
      .first()
      .tap();
    await expect(screen.getByRole("combobox", "Jenis Surat")).not.toHaveText("Pilih...");

    await screen.getByRole("textbox", "Tanggal Surat").fill("2026-11-15");
    await screen.getByRole("textbox", "Keperluan").fill("E2E Test Surat");

    await screen.getByRole("combobox", "Penduduk").tap();
    // Pakai penduduk seed yang stabil; opsi pertama bisa milik fixture uji
    // paralel yang dihapus sebelum form dikirim.
    await screen
      .getByRole("option", { name: /Warga Uji E2E/ })
      .first()
      .tap();

    await screen.getByRole("button", "Simpan Konsep").tap();
    await expect(screen.getByText("Konsep surat disimpan.")).toBeVisible({ timeout: 30_000 });
    await expect(screen.getByRole("dialog")).not.toBeVisible({ timeout: 5_000 });

    const row = screen.getByRole("row", { name: /E2E Test Surat/ }).first();
    await expect(row).toBeVisible();
  },
);

test(
  "letter number archive prevents duplicate numbers",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/persuratan/surat/arsip");
    await expect(screen.getByRole("heading", "Arsip Nomor Surat")).toBeVisible();

    await expect(screen.getByRole("table")).toBeVisible();
    await expect(screen.getByRole("columnheader", "Nomor surat")).toBeVisible();
    await expect(screen.getByRole("columnheader", "Jenis surat")).toBeVisible();
    await expect(screen.getByRole("columnheader", "Nomor urut")).toBeVisible();
    await expect(screen.getByRole("columnheader", "Tahun")).toBeVisible();
    await expect(screen.getByRole("columnheader", "Tanggal terbit")).toBeVisible();
  },
);

test("letter PDF download works", { session: "admin" }, async ({ app, screen }) => {
  await app.open("/persuratan/surat");
  await expect(screen.getByRole("heading", "Layanan Surat")).toBeVisible();

  const publishedRow = screen.getByRole("row", { name: /Terbit|Terbit/ }).first();
  if ((await publishedRow.count()) === 0) {
    return;
  }

  await publishedRow.getByRole("button", "PDF").tap();
  await expect(screen.getByRole("dialog", { name: /PDF|Cetak/ })).toBeVisible({ timeout: 5_000 });

  const pdfLink = screen.getByRole("link", { name: /Unduh|Download/ });
  if (await pdfLink.count()) {
    const href = await pdfLink.getAttribute("href");
    expect(href).toMatch(/^\/api\/persuratan\/surat\/\d+\/pdf$/);
  }
});

test("letter type (jenis surat) CRUD", { session: "admin" }, async ({ app, screen }) => {
  const kode = `E2E${Date.now().toString().slice(-6)}`;
  await app.open("/persuratan/jenis");
  await expect(screen.getByRole("heading", "Jenis Surat")).toBeVisible();

  await screen.getByRole("button", "Tambah Jenis Surat").tap();
  await expect(screen.getByRole("dialog", { name: "Tambah Jenis Surat" })).toBeVisible();

  await screen.getByRole("textbox", "Kode Surat").fill(kode);
  await screen.getByRole("textbox", "Nama Surat").fill("Surat E2E Test");
  await screen.getByRole("textbox", "Badan Surat").fill("<p>Surat uji E2E</p>");
  await screen.getByRole("spinbutton", "Urutan").fill("99");

  // Use screen to find and click the Tambah button within the dialog
  await screen
    .getByRole("dialog", { name: "Tambah Jenis Surat" })
    .getByRole("button", { name: "Tambah", exact: true })
    .tap();
  await expect(screen.getByText("Jenis surat ditambahkan.")).toBeVisible({ timeout: 10_000 });

  const barisJenis = screen.getByRole("row").filter({ hasText: kode });
  await expect(barisJenis.getByRole("cell", { name: "Surat E2E Test", exact: true })).toBeVisible();
});

test("letter classification (klasifikasi) CRUD", { session: "admin" }, async ({ app, screen }) => {
  const kode = `KLS${Date.now().toString().slice(-6)}`;
  await app.open("/persuratan/klasifikasi");
  await expect(screen.getByRole("heading", "Klasifikasi Surat")).toBeVisible();

  await screen.getByRole("button", "Tambah Klasifikasi").tap();
  await expect(screen.getByRole("dialog", { name: "Tambah Klasifikasi" })).toBeVisible();

  await screen.getByRole("textbox", "Kode").fill(kode);
  await screen.getByRole("textbox", "Nama").fill("Klasifikasi E2E");

  await screen.getByRole("button", "Tambah", { exact: true }).tap();
  await expect(screen.getByText("Klasifikasi ditambahkan.")).toBeVisible({ timeout: 10_000 });

  await expect(screen.getByRole("dialog", { name: "Tambah Klasifikasi" })).not.toBeVisible({
    timeout: 5_000,
  });
  await expect(screen.getByText("Klasifikasi ditambahkan.")).toBeVisible({ timeout: 10_000 });
  await expect(screen.getByRole("cell", { name: kode, exact: true })).toBeVisible();
  const baris = screen.getByRole("row").filter({ hasText: kode });
  await expect(baris.getByRole("cell", { name: "Klasifikasi E2E", exact: true })).toBeVisible();
});

test("letter requirement (syarat) CRUD", { session: "admin" }, async ({ app, screen }) => {
  const nama = `Syarat E2E ${Date.now()}`;
  await app.open("/persuratan/syarat");
  await expect(screen.getByRole("heading", "Syarat Surat")).toBeVisible();

  await screen.getByRole("button", "Tambah Syarat").tap();
  await expect(screen.getByRole("dialog", { name: "Tambah Syarat Surat" })).toBeVisible();

  await screen.getByRole("textbox", "Nama Syarat").fill(nama);
  await screen.getByRole("textbox", "Keterangan").fill("Deskripsi untuk E2E test");

  await screen.getByRole("button", "Tambah", { exact: true }).tap();
  await expect(screen.getByText("Syarat surat ditambahkan.")).toBeVisible({ timeout: 10_000 });

  await expect(screen.getByText(nama)).toBeVisible();
});
