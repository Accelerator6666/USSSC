import { compareISODate } from "./date.js";
import type { AssetType, ISODate, SettlementRule } from "./types.js";

export const SETTLEMENT_RULES: readonly SettlementRule[] = [
  {
    id: "us-equity-t2-2017",
    assetTypes: ["equity", "etf"],
    effectiveFrom: "2017-09-05",
    effectiveTo: "2024-05-27",
    cycleDays: 2,
    label: "U.S. equities standard T+2 settlement",
    sourceLabel: "SEC Rule 15c6-1 — historical T+2 cycle",
    sourceUrl:
      "https://www.sec.gov/investor/alerts/ib_t2_settlement.html"
  },
  {
    id: "us-equity-t1-2024",
    assetTypes: ["equity", "etf"],
    effectiveFrom: "2024-05-28",
    cycleDays: 1,
    label: "U.S. equities standard T+1 settlement",
    sourceLabel: "SEC Rule 15c6-1 — T+1 compliance date 2024-05-28",
    sourceUrl:
      "https://www.sec.gov/compliance/risk-alerts/shortening-securities-transaction-settlement-cycle"
  }
] as const;

export function resolveSettlementRule(
  tradeDate: ISODate,
  assetType: AssetType
): SettlementRule {
  const rule = SETTLEMENT_RULES.find((candidate) => {
    if (!candidate.assetTypes.includes(assetType)) {
      return false;
    }

    if (compareISODate(tradeDate, candidate.effectiveFrom) < 0) {
      return false;
    }

    if (
      candidate.effectiveTo &&
      compareISODate(tradeDate, candidate.effectiveTo) > 0
    ) {
      return false;
    }

    return true;
  });

  if (!rule) {
    throw new RangeError(
      `No settlement rule is configured for ${assetType} on ${tradeDate}.`
    );
  }

  return rule;
}
