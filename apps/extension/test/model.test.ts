import { describe, expect, it } from "vitest";
import { getSettlementState, localISODate } from "../src/model";

describe("v0.4 local settlement state", () => {
  it("marks a future settlement date as pending", () => {
    expect(getSettlementState("2026-10-05", "2026-10-04")).toBe("pending");
  });

  it("marks the current settlement date as today", () => {
    expect(getSettlementState("2026-10-04", "2026-10-04")).toBe("today");
  });

  it("marks a past expected settlement date as settled/date-passed", () => {
    expect(getSettlementState("2026-10-03", "2026-10-04")).toBe("settled");
  });

  it("formats a device-local date without UTC rollover", () => {
    const sample = new Date(2026, 9, 4, 23, 45, 0);
    expect(localISODate(sample)).toBe("2026-10-04");
  });
});
