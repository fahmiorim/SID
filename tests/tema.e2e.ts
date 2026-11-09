import { test } from "@e2e-dev/web";
import { expect } from "e2e";

/**
 * Katalog: OS-WEB-016 — teks berjalan dan tautan sosial media disimpan lalu
 * tampil di situs publik; OS-WEB-017 — opsi tampilan tema (warna primer/
 * sekunder, tipografi, kelengkungan sudut, gaya header, judul/tombol hero)
 * tersimpan dan benar-benar dipakai tema aktif.
 *
 * Kedua ID diuji dalam satu alur karena formulir tema mengirim seluruh opsi
 * sekaligus; dua test paralel pada desa yang sama akan saling menimpa.
 */
test(
  "OS-WEB-016/017 — opsi tema tersimpan dan diterapkan di situs publik",
  { session: "admin", timeout: 180_000 },
  async ({ app, screen, browser }) => {
    const teks = `Layanan darurat desa 24 jam — uji E2E ${Date.now()}`;
    const facebook = "https://facebook.com/desa-contoh-e2e";
    const heroJudul = `Portal Uji Tema ${Date.now()}`;
    const heroTombol = "Mulai Layanan Uji";
    const warnaPrimer = "#2f6fed";
    const warnaSekunder = "#0b3d91";

    await app.open("/konten/tema");
    await expect(screen.getByRole("heading", { name: "Tema Situs" })).toBeVisible();
    await expect(screen.getByText("Tema terpasang")).toBeVisible();

    const asli = await browser.evaluate(() => {
      const nilai = (id: string) => document.querySelector<HTMLInputElement>(`#${id}`)?.value ?? "";
      const label = (id: string) =>
        document.querySelector<HTMLElement>(`#${id}`)?.textContent?.trim() ?? "";
      return {
        teks: document.querySelector<HTMLTextAreaElement>("#teksBerjalan")?.value ?? "",
        facebook: nilai("sosmed_facebook"),
        warnaPrimer: nilai("warnaPrimer"),
        warnaSekunder: nilai("warnaSekunder"),
        kelengkungan: nilai("kelengkungan"),
        heroJudul: nilai("heroJudul"),
        heroTombol: nilai("heroTombol"),
        heroTombolUrl: nilai("heroTombolUrl"),
        font: label("font"),
        headerVarian: label("headerVarian"),
      };
    });

    const aturWarna = (id: string, nilai: string) =>
      browser.evaluate(
        ({ id, nilai }) => {
          const el = document.querySelector<HTMLInputElement>(`#${id}`);
          if (el) el.value = nilai;
        },
        { id, nilai },
      );

    try {
      await screen.getByLabel("Teks berjalan").fill(teks);
      await screen.getByLabel("Facebook").fill(facebook);
      await aturWarna("warnaPrimer", warnaPrimer);
      await aturWarna("warnaSekunder", warnaSekunder);
      await screen.getByLabel("Kelengkungan sudut (rem)").fill("1.25");
      await screen.getByLabel("Judul hero beranda").fill(heroJudul);
      await screen.getByLabel("Teks tombol utama").fill(heroTombol);
      await screen.getByLabel("Tautan tombol utama").fill("/desa/pengaduan");

      await screen.getByRole("combobox", { name: "Tipografi" }).tap();
      await screen.getByRole("option", { name: "Serif klasik" }).tap();
      await screen.getByRole("combobox", { name: "Gaya header" }).tap();
      await screen.getByRole("option", { name: "Berwarna" }).tap();

      await screen.getByRole("button", { name: "Simpan pengaturan tema" }).tap();
      // Tunggu Server Action selesai sebelum navigasi; suite paralel dapat
      // memperlambat respons dan navigasi terlalu cepat membatalkan simpan.
      await expect(screen.getByText("Pengaturan tema disimpan.")).toBeVisible({ timeout: 30_000 });

      // Opsi bertahan setelah muat ulang.
      await app.open("/konten/tema");
      const tersimpan = await browser.evaluate(() => ({
        warnaPrimer: document.querySelector<HTMLInputElement>("#warnaPrimer")?.value ?? "",
        warnaSekunder: document.querySelector<HTMLInputElement>("#warnaSekunder")?.value ?? "",
        font: document.querySelector<HTMLElement>("#font")?.textContent?.trim() ?? "",
        headerVarian:
          document.querySelector<HTMLElement>("#headerVarian")?.textContent?.trim() ?? "",
      }));
      expect(tersimpan.warnaPrimer.toLowerCase()).toBe(warnaPrimer);
      expect(tersimpan.warnaSekunder.toLowerCase()).toBe(warnaSekunder);
      expect(tersimpan.font).toBe("Serif klasik");
      expect(tersimpan.headerVarian).toBe("Berwarna");
      await expect(screen.getByLabel("Kelengkungan sudut (rem)")).toHaveValue("1.25");
      await expect(screen.getByLabel("Judul hero beranda")).toHaveValue(heroJudul);
      await expect(screen.getByLabel("Teks tombol utama")).toHaveValue(heroTombol);
      await expect(screen.getByLabel("Tautan tombol utama")).toHaveValue("/desa/pengaduan");

      // Opsi benar-benar dipakai situs publik: CSS variable, hero, dan header.
      await app.open("/");
      await expect(screen.getByRole("heading", { level: 1 })).toHaveText(heroJudul);
      await expect(screen.getByRole("link", { name: heroTombol })).toHaveAttribute(
        "href",
        "/desa/pengaduan",
      );
      await expect(screen.getByText(teks)).toBeVisible({ timeout: 10_000 });
      await expect(screen.getByRole("link", { name: /facebook/i }).first()).toHaveAttribute(
        "href",
        facebook,
      );

      const tampilan = await browser.evaluate(() => {
        const root = document.querySelector<HTMLElement>('[data-theme="esensi"]');
        const cs = root ? getComputedStyle(root) : null;
        const tombol = Array.from(document.querySelectorAll("a")).find(
          (el) => el.textContent?.trim() === "Mulai Layanan Uji",
        );
        const gayaTombol = tombol ? getComputedStyle(tombol) : null;
        return {
          primer: cs?.getPropertyValue("--pub-primary").trim() ?? "",
          sekunder: cs?.getPropertyValue("--pub-secondary").trim() ?? "",
          radius: cs?.getPropertyValue("--pub-radius").trim() ?? "",
          font: cs?.getPropertyValue("--pub-font").trim() ?? "",
          varianHeader:
            document.querySelector("header[data-varian]")?.getAttribute("data-varian") ?? "",
          warnaTombol: gayaTombol?.backgroundColor ?? "",
          radiusTombol: gayaTombol?.borderRadius ?? "",
        };
      });
      expect(tampilan.primer.toLowerCase()).toBe(warnaPrimer);
      expect(tampilan.sekunder.toLowerCase()).toBe(warnaSekunder);
      expect(tampilan.radius).toBe("1.25rem");
      expect(tampilan.font).toContain("Georgia");
      expect(tampilan.varianHeader).toBe("berwarna");
      expect(tampilan.warnaTombol).toBe("rgb(47, 111, 237)");
      expect(tampilan.radiusTombol).toBe("20px");
    } finally {
      await app.open("/konten/tema");
      await screen.getByLabel("Teks berjalan").fill(asli.teks);
      await screen.getByLabel("Facebook").fill(asli.facebook);
      await aturWarna("warnaPrimer", asli.warnaPrimer);
      await aturWarna("warnaSekunder", asli.warnaSekunder);
      await screen.getByLabel("Kelengkungan sudut (rem)").fill(asli.kelengkungan);
      await screen.getByLabel("Judul hero beranda").fill(asli.heroJudul);
      await screen.getByLabel("Teks tombol utama").fill(asli.heroTombol);
      await screen.getByLabel("Tautan tombol utama").fill(asli.heroTombolUrl);

      await screen.getByRole("combobox", { name: "Tipografi" }).tap();
      await screen.getByRole("option", { name: asli.font, exact: true }).tap();
      await screen.getByRole("combobox", { name: "Gaya header" }).tap();
      await screen.getByRole("option", { name: asli.headerVarian, exact: true }).tap();

      await screen.getByRole("button", { name: "Simpan pengaturan tema" }).tap();
      // Pastikan nilai awal benar-benar dipulihkan agar ulangan suite tidak
      // mewarisi opsi uji dari percobaan sebelumnya.
      await expect(screen.getByText("Pengaturan tema disimpan.")).toBeVisible({ timeout: 30_000 });
      await app.open("/");
      const pulih = await browser.evaluate(() => {
        const root = document.querySelector<HTMLElement>('[data-theme="esensi"]');
        return root ? getComputedStyle(root).getPropertyValue("--pub-primary").trim() : "";
      });
      expect(pulih.toLowerCase()).toBe(asli.warnaPrimer.toLowerCase());
    }
  },
);
