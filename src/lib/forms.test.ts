import { describe, expect, it } from "vitest";

import { todayIsoDate } from "./forms";

describe("todayIsoDate", () => {
  it("memakai komponen tanggal lokal, bukan UTC", () => {
    expect(todayIsoDate(new Date(2026, 0, 5, 0, 30))).toBe("2026-01-05");
    expect(todayIsoDate(new Date(2026, 9, 20, 23, 59))).toBe("2026-10-20");
  });

  it("memberi nol di depan bulan dan tanggal", () => {
    expect(todayIsoDate(new Date(2026, 1, 1, 12, 0))).toBe("2026-02-01");
  });
});
