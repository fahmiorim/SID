import { beforeEach, describe, expect, it, vi } from "vitest";

import { idleActionState } from "@/lib/action-state";

import { tanggapiPengaduanAction } from "./actions";

const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  tanggapiPengaduanData: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/features/pengaduan/application/use-cases", () => ({
  hapusPengaduanData: vi.fn(),
  setPublikPengaduanData: vi.fn(),
  tanggapiPengaduanData: mocks.tanggapiPengaduanData,
}));

function tanggapanForm(): FormData {
  const form = new FormData();
  form.set("id", "41");
  form.set("status", "diproses");
  form.set("tanggapan", "Pengaduan sedang ditindaklanjuti.");
  return form;
}

beforeEach(() => {
  mocks.revalidatePath.mockReset();
  mocks.tanggapiPengaduanData.mockReset();
});

describe("tanggapiPengaduanAction", () => {
  it("memperingatkan operator bila status tersimpan tetapi email gagal", async () => {
    mocks.tanggapiPengaduanData.mockResolvedValue({ id: 41, notification: "failed" });

    const state = await tanggapiPengaduanAction(idleActionState, tanggapanForm());

    expect(state).toMatchObject({ status: "success", tone: "warning" });
    if (state.status === "success") {
      expect(state.message).toContain("Tanggapan pengaduan disimpan");
      expect(state.message).toContain("email notifikasi gagal");
    }
  });

  it("mengonfirmasi ketika Resend menerima email untuk diproses", async () => {
    mocks.tanggapiPengaduanData.mockResolvedValue({ id: 41, notification: "sent" });

    const state = await tanggapiPengaduanAction(idleActionState, tanggapanForm());

    expect(state).toMatchObject({ status: "success" });
    if (state.status === "success") {
      expect(state.tone).toBeUndefined();
      expect(state.message).toContain("diterima Resend");
    }
  });
});
