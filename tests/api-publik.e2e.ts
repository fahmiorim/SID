import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// ============================================================================
// OS-OPS-011 — API data publik `/api/publik/informasi` dan `/api/publik/dokumen` mengembalikan dokumen
// dengan paginasi (`page`, `pageSize`, bawaan 20, maksimum 100) dan metadata pagination;
// `data` tetap array di endpoint dokumen. `/api/publik/inventaris` mendukung `search`,
// `/api/publik/surat` agenda + jenis surat; tenant dari `Host`.
// **Kontrak OpenAPI 3.1** di `/api/publik/openapi`, **rate limit** 60 permintaan/menit per IP per endpoint
// memakai sliding-window MySQL lintas instans, dan **audit** `api.publik.akses`. Test
// `features/rate-limit/application/rate-limit.test.ts`, `openapi.test.ts`, `public-api.test.ts`,
// serta route dokumen/inf…
// ============================================================================
test("API publik `/api/publik/informasi` merespons JSON dengan paginasi", async ({
  app,
  browser,
}) => {
  await app.open("/");
  const res = await browser.evaluate(async () => {
    const r = await fetch("/api/publik/informasi?page=1&pageSize=20");
    return { status: r.status, headers: r.headers.get("content-type"), body: await r.json() };
  });
  expect(res.status).toBe(200);
  expect(res.headers).toContain("application/json");
  expect(res.body.success).toBe(true);
  expect(res.body.data).toBeTruthy();
  expect(typeof res.body.data).toBe("object");
});

// ============================================================================
// OS-OPS-012 — API eksternal ber-API key (`EKSTERNAL_API_KEY`, SHA-256 + `timingSafeEqual`,
// rate limit 100 permintaan/menit per kunci dengan sliding-window MySQL lintas instans):
// `POST /api/eksternal/tte/tanda-tangan` (PDF → PDF bertanda tangan),
// `GET /api/eksternal/surat/[token]` (metadata non-pribadi; token 64 hex),
// dan `POST /api/eksternal/surat/verifikasi`. Tenant dari host, audit `api.eksternal.*`.
// **Ditambah kontrak OpenAPI 3.1** di `GET /api/eksternal/openapi` (skema API key, endpoint TTE/verifikasi,
// format galat) yang disusun dari kode. **Ditambah endpoint tulis surat** `POST /api/eksternal/surat` (JSON: NIK, jenis surat,
// isian, no HP, keterangan): penduduk dicari dari NIK pada desa API key, isian divalidasi terhadap form jenis s…
// ============================================================================
test("API eksternal OpenAPI kontrak tersedia", async ({ app, browser }) => {
  await app.open("/");
  const res = await browser.evaluate(async () => {
    const r = await fetch("/api/eksternal/openapi");
    return { status: r.status, headers: r.headers.get("content-type") };
  });
  expect(res.status).toBe(200);
  expect(res.headers).toContain("application/json");
});
