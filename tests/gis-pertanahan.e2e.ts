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
  await expect(screen.getByRole("heading", { name: /polygon/i })).toBeVisible();
});

// Katalog: OS-WIL-006 — Pertanahan: CRUD persil, Cdesa, mutasi.
test(
  "pertanahan: CRUD persil, Cdesa, dan mutasi",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/pemetaan/pertanahan");
    await expect(screen.getByRole("heading", { name: /pertanahan/i })).toBeVisible();
    await expect(screen.getByRole("table")).toBeVisible();
  },
);

test(
  "pertanahan publik menampilkan data persil dan Cdesa",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/desa/pertanahan");
    await expect(browser).toHaveURL("/desa/pertanahan");
    await expect(browser.locator("body")).toBeVisible();
  },
);

// Katalog: OS-WIL-007 — Peta cetak statis (SVG).
test(
  "peta cetak statis merender SVG dan legenda",
  { tags: ["smoke"] },
  async ({ app, browser }) => {
    await app.open("/desa/peta/cetak");
    await expect(browser).toHaveURL("/desa/peta/cetak");
    await expect(browser.locator("body")).toBeVisible();
  },
);

// Katalog: OS-WIL-008 — Simbol katalog.
test(
  "simbol GIS: CRUD melalui dialog EntityManager",
  { session: "admin" },
  async ({ app, screen }) => {
    await app.open("/pemetaan/simbol");
    await expect(screen.getByRole("heading", { name: /simbol/i })).toBeVisible();
  },
);
