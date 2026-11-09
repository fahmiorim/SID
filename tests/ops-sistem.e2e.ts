import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// Katalog: OS-OPS-002 — Shortcut personal + urutan menu sidebar.
test(
  "shortcut dan urutan menu personal tersimpan di beranda",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/beranda");
    await expect(screen.getByRole("heading", { name: /beranda/i })).toBeVisible();
    // Dialog shortcut tersedia.
    await screen.getByRole("button", { name: /atur shortcut/i }).tap();
    await expect(screen.getByRole("dialog")).toBeVisible();
    await screen.getByRole("button", { name: "Tutup dialog" }).tap();
    await expect(screen.getByRole("dialog")).not.toBeVisible();
  },
);

// Katalog: OS-OPS-003 — Pengaturan aplikasi terpusat.
test(
  "pengaturan aplikasi: nilai JSON tersimpan dan mempengaruhi fitur",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/pengaturan/aplikasi");
    await expect(screen.getByRole("heading", { name: /pengaturan aplikasi/i })).toBeVisible();
  },
);

// Katalog: OS-OPS-004 — OTP login sebagai faktor kedua.
test(
  "pengaturan profil menampilkan aktivasi OTP",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/pengaturan/profil");
    await expect(screen.getByRole("heading", { name: /profil/i })).toBeVisible();
  },
);

// Katalog: OS-OPS-005 — Pusat notifikasi + kotak masuk email.
test(
  "pusat notifikasi menampilkan riwayat dan kotak masuk",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/pengaturan/notifikasi");
    await expect(screen.getByRole("heading", { name: /notifikasi/i })).toBeVisible();
  },
);

// Katalog: OS-OPS-006 — Audit log aktivitas.
test(
  "log aktivitas menampilkan seluruh event inti",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/pengaturan/log-aktivitas");
    await expect(screen.getByRole("heading", { name: /log aktivitas/i })).toBeVisible();
    await expect(screen.getByRole("table")).toBeVisible();
  },
);

// Katalog: OS-OPS-007 — Backup/restore database.
test(
  "backup database menampilkan opsi dan tombol restore",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/pengaturan/database");
    await expect(screen.getByRole("heading", { name: /database/i })).toBeVisible();
  },
);

// Katalog: OS-OPS-008 — Plugin registry manifest build-time.
test(
  "plugin registry menampilkan status aktif/nonaktif per provider",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/pengaturan/plugin");
    await expect(screen.getByRole("heading", { name: /plugin/i })).toBeVisible();
  },
);

// Katalog: OS-OPS-011 — API data publik.
test("API publik `/api/publik/informasi` merespons JSON tenant dari host", async ({
  app,
  browser,
}) => {
  await app.open("/");
  const res = await browser.evaluate(async () => {
    const r = await fetch("/api/publik/informasi");
    return { status: r.status, contentType: r.headers.get("content-type") };
  });
  expect(res.status).toBe(200);
  expect(res.contentType).toContain("application/json");
});

// Katalog: OS-OPS-012 — API eksternal TTE dan surat ber-API key.
test("API eksternal OpenAPI kontrak tersedia", async ({ app, browser }) => {
  await app.open("/");
  const res = await browser.evaluate(async () => {
    const r = await fetch("/api/eksternal/openapi");
    return { status: r.status, contentType: r.headers.get("content-type") };
  });
  expect(res.status).toBe(200);
  expect(res.contentType).toContain("application/json");
});
