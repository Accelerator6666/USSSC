import { isWeekend, yearOf } from "../date.js";
import type { CalendarStatus, ISODate } from "../types.js";

export const CALENDAR_VERSION = "us-equities-2024-2026.1";
export const SUPPORTED_CALENDAR_YEARS = [2024, 2025, 2026] as const;

const TRADING_CLOSURES: Record<number, ReadonlySet<ISODate>> = {
  2024: new Set([
    "2024-01-01",
    "2024-01-15",
    "2024-02-19",
    "2024-03-29",
    "2024-05-27",
    "2024-06-19",
    "2024-07-04",
    "2024-09-02",
    "2024-11-28",
    "2024-12-25"
  ]),
  2025: new Set([
    "2025-01-01",
    "2025-01-09",
    "2025-01-20",
    "2025-02-17",
    "2025-04-18",
    "2025-05-26",
    "2025-06-19",
    "2025-07-04",
    "2025-09-01",
    "2025-11-27",
    "2025-12-25"
  ]),
  2026: new Set([
    "2026-01-01",
    "2026-01-19",
    "2026-02-16",
    "2026-04-03",
    "2026-05-25",
    "2026-06-19",
    "2026-07-03",
    "2026-09-07",
    "2026-11-26",
    "2026-12-25"
  ])
};

const SETTLEMENT_CLOSURES: Record<number, ReadonlySet<ISODate>> = {
  2024: new Set([
    "2024-01-01",
    "2024-01-15",
    "2024-02-19",
    "2024-03-29",
    "2024-05-27",
    "2024-06-19",
    "2024-07-04",
    "2024-09-02",
    "2024-10-14",
    "2024-11-11",
    "2024-11-28",
    "2024-12-25"
  ]),
  2025: new Set([
    "2025-01-01",
    "2025-01-20",
    "2025-02-17",
    "2025-04-18",
    "2025-05-26",
    "2025-06-19",
    "2025-07-04",
    "2025-09-01",
    "2025-10-13",
    "2025-11-11",
    "2025-11-27",
    "2025-12-25"
  ]),
  2026: new Set([
    "2026-01-01",
    "2026-01-19",
    "2026-02-16",
    "2026-04-03",
    "2026-05-25",
    "2026-06-19",
    "2026-07-03",
    "2026-09-07",
    "2026-10-12",
    "2026-11-11",
    "2026-11-26",
    "2026-12-25"
  ])
};

export class UnsupportedCalendarYearError extends RangeError {
  constructor(year: number) {
    super(
      `USSSC calendar does not yet contain a verified U.S. equity calendar for ${year}.`
    );
    this.name = "UnsupportedCalendarYearError";
  }
}

function assertSupportedYear(date: ISODate): number {
  const year = yearOf(date);
  if (!SUPPORTED_CALENDAR_YEARS.includes(year as 2024 | 2025 | 2026)) {
    throw new UnsupportedCalendarYearError(year);
  }
  return year;
}

export function getUsEquityTradingStatus(date: ISODate): CalendarStatus {
  const year = assertSupportedYear(date);

  if (isWeekend(date)) {
    return { open: false, reason: "Weekend — U.S. equity market closed" };
  }

  if (TRADING_CLOSURES[year]?.has(date)) {
    return { open: false, reason: "U.S. equity market full-day closure" };
  }

  return { open: true, reason: "U.S. equity trading day" };
}

export function getUsEquitySettlementStatus(date: ISODate): CalendarStatus {
  const year = assertSupportedYear(date);

  if (isWeekend(date)) {
    return { open: false, reason: "Weekend — not a standard settlement day" };
  }

  if (SETTLEMENT_CLOSURES[year]?.has(date)) {
    return {
      open: false,
      reason: "NSCC/DTC standard U.S. equity settlement unavailable"
    };
  }

  return { open: true, reason: "Standard U.S. equity settlement day" };
}

export function isUsEquityTradingDay(date: ISODate): boolean {
  return getUsEquityTradingStatus(date).open;
}

export function isUsEquitySettlementDay(date: ISODate): boolean {
  return getUsEquitySettlementStatus(date).open;
}
