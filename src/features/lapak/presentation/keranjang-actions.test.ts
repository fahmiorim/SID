import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { tambahKeKeranjang } from "@/features/lapak/application/keranjang-use-cases";
import { createIdleActionState } from "@/lib/action-state";

import { addToCartAction } from "./keranjang-actions";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/features/desa/application/resolve-village", () => ({
  getIdentitasFromRequest: vi.fn(),
}));
vi.mock("@/features/lapak/application/keranjang-use-cases", () => ({
  hapusDariKeranjang: vi.fn(),
  tambahKeKeranjang: vi.fn(),
  updateJumlahKeranjang: vi.fn(),
}));
vi.mock("@/lib/env", () => ({ env: { NODE_ENV: "production" } }));

function buatFormData(): FormData {
  const formData = new FormData();
  formData.set("lapakId", "12");
  formData.set("produkId", "34");
  formData.set("jumlah", "2");
  return formData;
}

describe("addToCartAction session cookie", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NODE_ENV", "production");
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
      set: vi.fn(),
    } as never);
    vi.mocked(getIdentitasFromRequest).mockResolvedValue({ id: 17 } as never);
    vi.mocked(tambahKeKeranjang).mockResolvedValue({ id: 1 });
  });

  it("uses an unpredictable guest key and sets a protected session cookie", async () => {
    vi.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);
    vi.spyOn(Math, "random").mockReturnValue(0.123456);

    const result = await addToCartAction(createIdleActionState<null>(), buatFormData());
    const cookieStore = await cookies();
    const setCall = vi.mocked(cookieStore.set).mock.calls[0];
    if (!setCall) throw new Error("cookieStore.set not called");
    const cookieName = setCall[0];
    const sessionKey = setCall[1];
    const options = setCall[2];

    expect(result.status).toBe("success");
    expect(sessionKey).toMatch(/^[a-f0-9]{64}$/);
    expect(sessionKey).not.toBe(
      createHash("sha256").update("1700000000000-0.123456").digest("hex"),
    );
    expect(tambahKeKeranjang).toHaveBeenCalledWith(sessionKey, 17, 12, 34, 2);
    expect(cookieName).toBe("lapak_session");
    expect(options).toEqual({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: true,
      maxAge: 30 * 24 * 60 * 60,
    });
  });
  it("reuses an existing guest session key without rotating its cookie", async () => {
    const cookieStore = {
      get: vi.fn().mockReturnValue({ value: "existing-guest-key" }),
      set: vi.fn(),
    };
    vi.mocked(cookies).mockResolvedValue(cookieStore as never);

    const result = await addToCartAction(createIdleActionState<null>(), buatFormData());

    expect(result.status).toBe("success");
    expect(tambahKeKeranjang).toHaveBeenCalledWith("existing-guest-key", 17, 12, 34, 2);
    expect(cookieStore.set).not.toHaveBeenCalled();
  });
});
