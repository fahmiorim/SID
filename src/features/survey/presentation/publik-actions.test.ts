import { headers } from "next/headers";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { batasiPermintaan } from "@/features/rate-limit/application/rate-limit";
import { simpanResponsPublikData } from "@/features/survey/application/use-cases";
import { createIdleActionState } from "@/lib/action-state";

import { kirimSurveiPublikAction } from "./publik-actions";

vi.mock("next/headers", () => ({ headers: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/features/rate-limit/application/rate-limit", () => ({ batasiPermintaan: vi.fn() }));
vi.mock("@/features/desa/application/resolve-village", () => ({
  getIdentitasFromRequest: vi.fn(),
}));
vi.mock("@/features/survey/application/use-cases", () => ({
  simpanResponsPublikData: vi.fn(),
}));

function buatFormData(): FormData {
  const formData = new FormData();
  formData.set("surveyId", "42");
  formData.set("nama", "Warga Contoh");
  formData.set("nik", "");
  formData.set("jawaban.7", "Jawaban contoh");
  return formData;
}

describe("kirimSurveiPublikAction rate limit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(headers).mockResolvedValue(new Headers({ "x-forwarded-for": "192.0.2.8" }));
    vi.mocked(getIdentitasFromRequest).mockResolvedValue({ id: 17 } as never);
    vi.mocked(batasiPermintaan).mockResolvedValue({
      dibatasi: false,
      sisa: 9,
      resetMs: 900_000,
    });
  });

  it("membatasi pengiriman per IP, desa, dan survei", async () => {
    const hasil = await kirimSurveiPublikAction(createIdleActionState<null>(), buatFormData());

    expect(hasil.status).toBe("success");
    expect(batasiPermintaan).toHaveBeenCalledWith("survei-publik:17:42:192.0.2.8", {
      batas: 10,
      jendelaMs: 900_000,
    });
    expect(simpanResponsPublikData).toHaveBeenCalledWith(
      17,
      42,
      { nama: "Warga Contoh", nik: null },
      { "7": "Jawaban contoh" },
    );
  });

  it("menolak sebelum menyimpan setelah kuota habis", async () => {
    vi.mocked(batasiPermintaan).mockResolvedValue({
      dibatasi: true,
      sisa: 0,
      resetMs: 900_000,
    });

    const hasil = await kirimSurveiPublikAction(createIdleActionState<null>(), buatFormData());

    expect(hasil).toMatchObject({
      status: "error",
      message: expect.stringContaining("Terlalu banyak"),
    });
    expect(simpanResponsPublikData).not.toHaveBeenCalled();
  });
});
