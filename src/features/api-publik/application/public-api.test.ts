import { beforeEach, describe, expect, it, vi } from "vitest";

import { resetBatasPermintaan } from "../domain/rate-limit";
import { jalankanApiPublik } from "./public-api";

vi.mock("@/features/publik/api/middleware", () => ({
  getTenantFromRequest: vi.fn(),
}));

vi.mock("@/features/audit/application/audit-use-cases", () => ({
  recordAuditEvent: vi.fn(),
}));

const middleware = await import("@/features/publik/api/middleware");
const audit = await import("@/features/audit/application/audit-use-cases");

function permintaan(ip = "10.0.0.1"): Request {
  return new Request("https://desa.example.id/api/publik/informasi", {
    headers: { "x-forwarded-for": ip, "user-agent": "vitest" },
  });
}

describe("jalankanApiPublik", () => {
  beforeEach(() => {
    resetBatasPermintaan();
    vi.mocked(audit.recordAuditEvent).mockReset();
  });

  it("mengembalikan data dan mencatat audit saat berhasil", async () => {
    vi.mocked(middleware.getTenantFromRequest).mockResolvedValueOnce({
      id: 7,
      namaDesa: "Desa Uji",
    } as Awaited<ReturnType<typeof middleware.getTenantFromRequest>>);

    const respons = await jalankanApiPublik(permintaan(), "informasi", async () => ({
      jumlah: 1,
    }));

    expect(respons.status).toBe(200);
    expect(respons.headers.get("Cache-Control")).toBe("no-store");
    expect(await respons.json()).toEqual({ success: true, data: { jumlah: 1 } });
    expect(audit.recordAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        villageId: 7,
        resource: "api-publik",
        resourceId: "informasi",
        ipAddress: "10.0.0.1",
      }),
    );
  });

  it("membalas 400 saat host tidak dikenali", async () => {
    vi.mocked(middleware.getTenantFromRequest).mockRejectedValueOnce(new Error("invalid host"));

    const respons = await jalankanApiPublik(permintaan(), "informasi", async () => ({}));

    expect(respons.status).toBe(400);
    expect(await respons.json()).toEqual({ success: false, error: "Desa tidak valid" });
    expect(audit.recordAuditEvent).not.toHaveBeenCalled();
  });

  it("membalas 429 setelah batas per IP tercapai", async () => {
    vi.mocked(middleware.getTenantFromRequest).mockResolvedValue({
      id: 7,
      namaDesa: "Desa Uji",
    } as Awaited<ReturnType<typeof middleware.getTenantFromRequest>>);

    let statusTerakhir = 0;
    for (let i = 0; i < 61; i += 1) {
      const respons = await jalankanApiPublik(
        permintaan("10.9.9.9"),
        "inventaris",
        async () => ({}),
      );
      statusTerakhir = respons.status;
    }

    expect(statusTerakhir).toBe(429);
  });

  it("membalas 500 tanpa membocorkan detail saat pengambilan data gagal", async () => {
    vi.mocked(middleware.getTenantFromRequest).mockResolvedValueOnce({
      id: 7,
      namaDesa: "Desa Uji",
    } as Awaited<ReturnType<typeof middleware.getTenantFromRequest>>);
    const galat = vi.spyOn(console, "error").mockImplementation(() => {});

    const respons = await jalankanApiPublik(permintaan(), "dokumen", async () => {
      throw new Error("koneksi DB putus");
    });

    expect(respons.status).toBe(500);
    expect(await respons.json()).toEqual({
      success: false,
      error: "Gagal mengambil data publik",
    });
    galat.mockRestore();
  });
});
