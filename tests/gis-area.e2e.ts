import { test } from "@e2e-dev/web";
import { expect } from "e2e";

/**
 * Katalog: OS-WIL-002 — GIS area.
 *
 * Area peta dibuat dari dialog admin dan dirujuk ke kategori polygon, lalu
 * dibuktikan tampil pada peta cetak publik lewat legenda polygonnya. Area
 * buatan UI harus langsung aktif; sebelumnya formulir area tidak mengirim
 * `enabled` sehingga setiap area tersimpan nonaktif dan tidak pernah muncul.
 */
test(
  "OS-WIL-002 area peta: CRUD dengan relasi polygon dan tampil di peta cetak",
  { session: "admin", timeout: 180_000 },
  async ({ app, screen }) => {
    const cap = Date.now();
    const namaPolygon = `Kategori Area ${cap}`;
    const namaArea = `Area Uji ${cap}`;
    const deskAwal = "Keterangan area awal";
    const deskBaru = "Keterangan area diubah";

    // Kategori polygon sebagai rujukan area.
    await app.open("/pemetaan/polygon");
    await screen.getByRole("button", { name: "Tambah Polygon" }).tap();
    await expect(screen.getByRole("dialog", { name: "Tambah Kategori Peta" })).toBeVisible();
    await screen.getByLabel("Nama Polygon").fill(namaPolygon);
    await screen.getByLabel("Warna (HEX)").fill("#0ea5e9");
    await screen.getByLabel("Tipe").selectOption({ label: "Root / Layer Utama" });
    await screen.getByRole("button", { name: "Simpan", exact: true }).tap();
    await expect(screen.getByText("Polygon berhasil dibuat.")).toBeVisible({ timeout: 10_000 });

    // Tambah area yang merujuk polygon tersebut.
    await app.open("/pemetaan/area");
    await expect(screen.getByRole("heading", { name: "Area Peta" })).toBeVisible();
    await screen.getByRole("button", { name: "Tambah Area" }).tap();
    await expect(screen.getByRole("dialog", { name: "Tambah Area Peta" })).toBeVisible();
    await screen.getByLabel("Nama Area").fill(namaArea);
    await screen.getByLabel("Kategori Polygon").selectOption({ label: namaPolygon });
    await screen
      .getByLabel("Path GeoJSON (Polygon)")
      .fill(
        '{"type":"Polygon","coordinates":[[[110.40,-7.20],[110.50,-7.20],[110.50,-7.30],[110.40,-7.30],[110.40,-7.20]]]}',
      );
    await screen.getByLabel("Keterangan").fill(deskAwal);
    await screen.getByLabel("Urutan").fill("3");
    await screen.getByRole("button", { name: "Simpan", exact: true }).tap();
    await expect(screen.getByText("Area berhasil dibuat.")).toBeVisible({ timeout: 10_000 });

    const baris = screen.getByRole("row", { name: new RegExp(namaArea) });
    await expect(baris).toBeVisible();
    await expect(baris.getByText(namaPolygon)).toBeVisible();
    await expect(baris.getByText(deskAwal)).toBeVisible();

    // Peta cetak publik memuat geometri dan legenda kategori polygon area.
    await app.open("/desa/peta/cetak");
    await expect(screen.getByRole("img", { name: /Peta desa/i })).toBeVisible();
    await expect(screen.getByText(new RegExp(namaPolygon))).toBeVisible();
    await expect(screen.getByText(/·\s*area/)).toBeVisible();

    // Ubah keterangan area.
    await app.open("/pemetaan/area");
    await baris.getByRole("button", { name: /ubah/i }).tap();
    await expect(screen.getByRole("dialog", { name: "Ubah Area Peta" })).toBeVisible();
    await screen.getByLabel("Keterangan").fill(deskBaru);
    await screen.getByRole("button", { name: "Simpan", exact: true }).tap();
    await expect(screen.getByText("Area berhasil diperbarui.")).toBeVisible({ timeout: 10_000 });
    await expect(baris.getByText(deskBaru)).toBeVisible({ timeout: 10_000 });

    // Hapus area lalu kategori polygon pembersih.
    await baris.getByRole("button", { name: /hapus/i }).tap();
    await expect(screen.getByText("Area berhasil dihapus.")).toBeVisible({ timeout: 10_000 });
    await expect(screen.getByRole("row", { name: new RegExp(namaArea) })).not.toBeVisible();

    await app.open("/pemetaan/polygon");
    const barisPolygon = screen.getByRole("row", { name: new RegExp(namaPolygon) });
    await barisPolygon.getByRole("button", { name: /hapus/i }).tap();
    await expect(screen.getByText("Polygon berhasil dihapus.")).toBeVisible({ timeout: 10_000 });

    // Legenda peta cetak tidak lagi memuat kategori yang dihapus.
    await app.open("/desa/peta/cetak");
    await expect(screen.getByText(new RegExp(namaPolygon))).not.toBeVisible();
  },
);
