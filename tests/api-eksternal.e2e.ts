import { randomBytes } from "node:crypto";
import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import {
  adaAuditEventUji,
  bacaPermohonanEksternalUji,
  buatApiKeyUji,
  buatDesaLainApiKeyUji,
  buatSuratUjiDenganToken,
  hapusApiKeyUji,
  hapusDesaLainApiKeyUji,
  hapusPermohonanEksternalUji,
  hapusSuratDariId,
  siapkanSuratEksternalUji,
} from "./support/database";

/**
 * Katalog: OS-OPS-012 — API eksternal untuk surat, verifikasi, TTE, dan
 * layanan pihak ketiga.
 *
 * Test ini memakai HTTP nyata pada build produksi. Kunci API disiapkan di DB
 * karena tidak ada halaman admin pembuat kunci; sesudah itu seluruh alur
 * dijalankan lewat route, bukan memanggil use case.
 */
test(
  "API eksternal surat: kunci API, tenant dari kunci, audit, dan kontrak OpenAPI",
  { session: "admin", timeout: 120_000 },
  async ({ app, browser }) => {
    const konteks = await siapkanSuratEksternalUji();
    const apiKey = await buatApiKeyUji({ name: `Kunci E2E surat ${Date.now()}` });
    const keterangan = `Permohonan API E2E ${Date.now()}`;

    try {
      await app.open("/");

      const hasil = await browser.evaluate(
        async (data) => {
          const badan = {
            nik: data.nik,
            letterTypeId: data.letterTypeId,
            isian: {},
            noHpAktif: "081234567890",
            keterangan: data.keterangan,
            // Klien tidak boleh menentukan desa.
            villageId: 999,
          };

          const tanpaKunci = await fetch("/api/eksternal/surat", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(badan),
          });

          const kunciSalah = await fetch("/api/eksternal/surat", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "X-API-Key": `SID_${"0".repeat(48)}`,
            },
            body: JSON.stringify(badan),
          });

          const denganKunci = await fetch("/api/eksternal/surat", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "X-API-Key": data.apiKey,
            },
            body: JSON.stringify(badan),
          });

          const dibuat = await denganKunci.json();
          const kontrak = await fetch("/api/eksternal/openapi");
          const openapi = await kontrak.json();

          return {
            tanpaKunci: { status: tanpaKunci.status },
            kunciSalah: { status: kunciSalah.status },
            denganKunci: { status: denganKunci.status, body: dibuat },
            openapi: {
              status: kontrak.status,
              origin: location.origin,
              body: openapi,
            },
          };
        },
        {
          apiKey: apiKey.key,
          nik: konteks.nik,
          letterTypeId: konteks.letterTypeId,
          keterangan,
        },
      );

      expect(hasil.tanpaKunci.status).toBe(401);
      expect(hasil.kunciSalah.status).toBe(401);
      expect(hasil.denganKunci.status).toBe(201);
      expect(hasil.denganKunci.body.ok).toBe(true);
      expect(hasil.denganKunci.body.data.noAntrian).toMatch(/^AN-/);

      const permohonan = await bacaPermohonanEksternalUji(keterangan);
      expect(permohonan).not.toBeNull();
      if (!permohonan) throw new Error("Permohonan API tidak tersimpan.");
      expect(permohonan.villageId).toBe(konteks.villageId);
      expect(permohonan.villageId).toBe(apiKey.villageId);
      expect(permohonan.residentId).toBe(konteks.residentId);
      expect(permohonan.letterTypeId).toBe(konteks.letterTypeId);
      expect(permohonan.noAntrian).toBe(hasil.denganKunci.body.data.noAntrian);
      expect(permohonan.syarat).toBeNull();
      expect(await adaAuditEventUji("api.eksternal.surat.create", String(permohonan.id))).toBe(
        true,
      );

      expect(hasil.openapi.status).toBe(200);
      expect(hasil.openapi.body.openapi).toBe("3.1.0");
      expect(hasil.openapi.body.servers[0].url).toBe(hasil.openapi.origin);
      for (const jalur of [
        "/api/eksternal/surat",
        "/api/eksternal/surat/{token}",
        "/api/eksternal/surat/verifikasi",
        "/api/eksternal/tte/tanda-tangan",
      ]) {
        expect(hasil.openapi.body.paths[jalur]).toBeTruthy();
      }
      expect(hasil.openapi.body.components.securitySchemes.ApiKeyAuth).toMatchObject({
        type: "apiKey",
        in: "header",
        name: "X-API-Key",
      });
    } finally {
      await hapusPermohonanEksternalUji(keterangan);
      await hapusApiKeyUji(apiKey.id);
    }
  },
);

test(
  "API eksternal verifikasi: token surat, format token, dan validasi TTE",
  { session: "admin", timeout: 90_000 },
  async ({ app, browser }) => {
    const token = randomBytes(32).toString("hex");
    const nomor = `E2E/API/${Date.now()}`;
    const surat = await buatSuratUjiDenganToken({
      token,
      nomor,
      jenis: "Surat Keterangan API E2E",
      tanggal: "2026-11-11",
    });
    const apiKey = await buatApiKeyUji({ name: `Kunci E2E verifikasi ${Date.now()}` });
    const desaLainId = await buatDesaLainApiKeyUji();
    const kunciDesaLain = await buatApiKeyUji({
      name: `Kunci E2E desa lain ${Date.now()}`,
      villageId: desaLainId,
    });

    try {
      await app.open("/");

      const hasil = await browser.evaluate(
        async (data) => {
          const tanpaKunci = await fetch(`/api/eksternal/surat/${data.token}`);
          const tokenSalah = await fetch(`/api/eksternal/surat/${"z".repeat(64)}`, {
            headers: { "X-API-Key": data.apiKey },
          });
          const metadata = await fetch(`/api/eksternal/surat/${data.token}`, {
            headers: { "X-API-Key": data.apiKey },
          });
          const metadataDesaLain = await fetch(`/api/eksternal/surat/${data.token}`, {
            headers: { "X-API-Key": data.kunciDesaLain },
          });
          const verifikasi = await fetch("/api/eksternal/surat/verifikasi", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "X-API-Key": data.apiKey,
            },
            body: JSON.stringify({ token: data.token }),
          });

          const formSalah = new FormData();
          formSalah.set(
            "berkas",
            new File([new Uint8Array([1, 2, 3])], "bukan-pdf.txt", { type: "text/plain" }),
          );
          const tteSalah = await fetch("/api/eksternal/tte/tanda-tangan", {
            method: "POST",
            headers: { "X-API-Key": data.apiKey },
            body: formSalah,
          });

          return {
            tanpaKunci: tanpaKunci.status,
            tokenSalah: tokenSalah.status,
            metadata: { status: metadata.status, body: await metadata.json() },
            metadataDesaLain: metadataDesaLain.status,
            verifikasi: { status: verifikasi.status, body: await verifikasi.json() },
            tteSalah: tteSalah.status,
          };
        },
        { token, apiKey: apiKey.key, kunciDesaLain: kunciDesaLain.key },
      );

      expect(hasil.tanpaKunci).toBe(401);
      expect(hasil.tokenSalah).toBe(400);
      expect(hasil.metadata.status).toBe(200);
      expect(hasil.metadata.body.surat.nomor).toBe(nomor);
      expect(hasil.metadata.body.surat.status).toBe("issued");
      // Kunci desa lain tidak boleh ikut membaca surat desa pemilik token.
      expect(hasil.metadataDesaLain).toBe(404);
      expect(hasil.verifikasi.status).toBe(200);
      expect(hasil.verifikasi.body.surat.nomor).toBe(nomor);
      expect(hasil.tteSalah).toBe(415);
    } finally {
      await hapusSuratDariId(surat.id);
      await hapusApiKeyUji(kunciDesaLain.id);
      await hapusDesaLainApiKeyUji(desaLainId);
      await hapusApiKeyUji(apiKey.id);
    }
  },
);
