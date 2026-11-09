import { describe, expect, it } from "vitest";

import { tataLetakKiosk } from "./tata-letak-kiosk";

describe("tataLetakKiosk", () => {
  it("memakai lanskap untuk orientasi 1 dan perangkat yang belum diketahui", () => {
    expect(tataLetakKiosk(1).orientasi).toBe("lanskap");
    expect(tataLetakKiosk(null).orientasi).toBe("lanskap");
    expect(tataLetakKiosk(undefined).orientasi).toBe("lanskap");
  });

  it("memakai potret untuk orientasi 0", () => {
    expect(tataLetakKiosk(0).orientasi).toBe("potret");
  });

  it("lanskap memberi kolom lebih banyak daripada potret", () => {
    expect(tataLetakKiosk(1).kelasGrid).toContain("xl:grid-cols-4");
    expect(tataLetakKiosk(0).kelasGrid).not.toContain("lg:grid-cols-3");
  });
});
