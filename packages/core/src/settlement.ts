import { addCalendarDays, parseISODate } from "./date.js";
import {
  CALENDAR_VERSION,
  getUsEquitySettlementStatus,
  getUsEquityTradingStatus
} from "./calendars/us-equities.js";
import { resolveSettlementRule } from "./rules.js";
import type {
  SettlementRequest,
  SettlementResult,
  SettlementTimelineEntry
} from "./types.js";

export class InvalidTradeDateError extends RangeError {
  constructor(date: string, reason: string) {
    super(`Invalid U.S. equity trade date ${date}: ${reason}`);
    this.name = "InvalidTradeDateError";
  }
}

export function calculateSettlement(
  request: SettlementRequest
): SettlementResult {
  parseISODate(request.tradeDate);

  const tradingStatus = getUsEquityTradingStatus(request.tradeDate);
  if (!tradingStatus.open) {
    throw new InvalidTradeDateError(request.tradeDate, tradingStatus.reason);
  }

  const rule = resolveSettlementRule(request.tradeDate, request.assetType);
  const timeline: SettlementTimelineEntry[] = [
    {
      date: request.tradeDate,
      kind: "trade",
      reason: tradingStatus.reason,
      countedBusinessDays: 0
    }
  ];

  let cursor = request.tradeDate;
  let counted = 0;

  while (counted < rule.cycleDays) {
    cursor = addCalendarDays(cursor, 1);
    const settlementStatus = getUsEquitySettlementStatus(cursor);

    if (!settlementStatus.open) {
      timeline.push({
        date: cursor,
        kind: "skipped",
        reason: settlementStatus.reason,
        countedBusinessDays: counted
      });
      continue;
    }

    counted += 1;
    timeline.push({
      date: cursor,
      kind: counted === rule.cycleDays ? "settlement" : "settlement-business-day",
      reason: settlementStatus.reason,
      countedBusinessDays: counted
    });
  }

  return {
    tradeDate: request.tradeDate,
    settlementDate: cursor,
    assetType: request.assetType,
    cycle: `T+${rule.cycleDays}`,
    cycleDays: rule.cycleDays,
    ruleId: rule.id,
    ruleLabel: rule.label,
    ruleSourceUrl: rule.sourceUrl,
    calendarVersion: CALENDAR_VERSION,
    timeline
  };
}
