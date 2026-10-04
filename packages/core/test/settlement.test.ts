import { describe, expect, it } from "vitest";
import {
  InvalidTradeDateError,
  calculateSettlement,
  getUsEquitySettlementStatus,
  getUsEquityTradingStatus
} from "../src/index.js";

describe("US equity settlement", () => {
  it("uses historical T+2 immediately before the T+1 transition", () => {
    const result = calculateSettlement({
      tradeDate: "2024-05-24",
      assetType: "equity"
    });

    expect(result.cycle).toBe("T+2");
    expect(result.settlementDate).toBe("2024-05-29");
  });

  it("uses T+1 from 2024-05-28", () => {
    const result = calculateSettlement({
      tradeDate: "2024-05-28",
      assetType: "equity"
    });

    expect(result.cycle).toBe("T+1");
    expect(result.settlementDate).toBe("2024-05-29");
  });

  it("skips Columbus Day when the market is open but standard settlement is unavailable", () => {
    expect(getUsEquityTradingStatus("2026-10-12").open).toBe(true);
    expect(getUsEquitySettlementStatus("2026-10-12").open).toBe(false);

    const result = calculateSettlement({
      tradeDate: "2026-10-09",
      assetType: "etf"
    });

    expect(result.settlementDate).toBe("2026-10-13");
    expect(result.timeline.some((entry) => entry.date === "2026-10-12" && entry.kind === "skipped")).toBe(true);
  });

  it("can settle on the 2025 Carter day of mourning although equity trading is closed", () => {
    expect(getUsEquityTradingStatus("2025-01-09").open).toBe(false);
    expect(getUsEquitySettlementStatus("2025-01-09").open).toBe(true);

    const result = calculateSettlement({
      tradeDate: "2025-01-08",
      assetType: "equity"
    });

    expect(result.settlementDate).toBe("2025-01-09");
  });

  it("rejects a weekend as a trade date", () => {
    expect(() =>
      calculateSettlement({ tradeDate: "2026-10-04", assetType: "equity" })
    ).toThrow(InvalidTradeDateError);
  });
});
