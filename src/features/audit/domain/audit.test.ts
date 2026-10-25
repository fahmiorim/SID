import { describe, expect, it } from "vitest";

import { AUDIT_EVENT_LABELS, AUDIT_EVENTS, serializeAuditDetails } from "./audit";

describe("domain audit", () => {
  it("memberi label untuk event login", () => {
    expect(AUDIT_EVENT_LABELS[AUDIT_EVENTS.loginSuccess]).toBe("Login berhasil");
    expect(AUDIT_EVENT_LABELS[AUDIT_EVENTS.loginFailure]).toBe("Login gagal");
  });

  it("serialisasi detail aman hanya bila ada isi", () => {
    expect(serializeAuditDetails(undefined)).toBeNull();
    expect(serializeAuditDetails({})).toBeNull();
    expect(serializeAuditDetails({ alasan: "kredensial" })).toBe(
      JSON.stringify({ alasan: "kredensial" }),
    );
  });
});
