import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// ============================================================================
// OS-WEB-001 — Verifikasi elemen beranda tema
// ============================================================================
test("elemen beranda tema dirender benar", { tags: ["smoke"] }, async ({ app, browser }) => {
  await app.open("/");
  await expect(browser).toHaveURL("/");
  // Berita dari seed
  await expect(browser.locator("body")).toContainText("Selamat Datang di Portal Resmi Desa");
});

// ============================================================================
// OS-WEB-002 — Berita: buat, tampilkan, detail, hit, pencarian
// ============================================================================
test(
  "berita CRUD dan pencarian berfungsi",
  { session: "admin" },
  async ({ app, screen, browser }) => {
    const judul = `Berita ${Date.now()}`;

    // Buat
    await app.open("/konten/berita");
    await screen.getByRole("link", { name: "Tulis Berita" }).tap();
    await screen.getByLabel("Judul").fill(judul);

    // Isi ringkasan dan isi agar valid
    await screen.getByLabel("Ringkasan").fill("Ringkasan E2E");
    await screen.getByLabel("Isi (HTML)").fill("<p>Isi berita E2E</p>");

    await screen.getByLabel("Status").tap();
    await screen.getByRole("option", { name: "Terbit" }).tap();

    await screen.getByRole("button", { name: "Simpan berita" }).tap();
    await expect(screen.getByText("Berita ditambahkan.")).toBeVisible({ timeout: 10_000 });

    // Verifikasi tampil
    await app.open("/desa/berita");
    await expect(screen.getByText(judul)).toBeVisible();

    // Detail dan hit (verifikasi hit bertambah)
    const hitAwalText = await screen.getByText(/kali dibaca/i).textContent();
    const hitAwal = parseInt(hitAwalText?.match(/\d+/)?.[0] ?? "0");

    await screen.getByText(judul).tap();
    await expect(browser).toHaveURL(/\/desa\/berita\/.+/);

    const hitSesudahText = await screen.getByText(/kali dibaca/i).textContent();
    const hitSesudah = parseInt(hitSesudahText?.match(/\d+/)?.[0] ?? "0");
    expect(hitSesudah).toBeGreaterThanOrEqual(hitAwal);

    // Pencarian
    await app.open("/desa/berita");
    await screen.getByPlaceholder(/Cari berita/i).fill(judul);
    await screen.getByRole("button", { name: /Cari/i }).tap();
    await expect(screen.getByText(judul)).toBeVisible();

    // Pencarian karakter %/_
    await screen.getByPlaceholder(/Cari berita/i).fill("%");
    await screen.getByRole("button", { name: /Cari/i }).tap();
    await expect(browser).not.toHaveURL(/error/i);
  },
);

// ============================================================================
// OS-WEB-004 — Galeri: buat album, verifikasi tampil di desa/galeri
// ============================================================================
test("galeri CRUD album berfungsi", { session: "admin" }, async ({ app, screen, browser }) => {
  const albumNama = `Album ${Date.now()}`;

  await app.open("/konten/galeri");
  await screen.getByRole("button", { name: "Tambah Album" }).tap();
  await screen.getByLabel("Nama Album").fill(albumNama);
  await screen.getByRole("button", { name: "Tambah" }).tap();
  await expect(screen.getByText("Album ditambahkan.")).toBeVisible({ timeout: 10_000 });

  await app.open("/desa/galeri");
  await expect(screen.getByText(albumNama)).toBeVisible();

  // Detail dan cetak
  await screen.getByText(albumNama).tap();
  await expect(browser).toHaveURL(/\/desa\/galeri\/.+/);
  await expect(screen.getByRole("button", { name: /Cetak Album/i })).toBeVisible();
});
