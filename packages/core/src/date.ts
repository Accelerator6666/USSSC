import type { ISODate } from "./types.js";

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseISODate(value: ISODate): Date {
  const match = ISO_DATE_RE.exec(value);
  if (!match) {
    throw new RangeError(`Invalid ISO date: ${value}`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new RangeError(`Invalid calendar date: ${value}`);
  }

  return date;
}

export function formatISODate(date: Date): ISODate {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addCalendarDays(value: ISODate, days: number): ISODate {
  const date = parseISODate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return formatISODate(date);
}

export function dayOfWeek(value: ISODate): number {
  return parseISODate(value).getUTCDay();
}

export function isWeekend(value: ISODate): boolean {
  const day = dayOfWeek(value);
  return day === 0 || day === 6;
}

export function compareISODate(a: ISODate, b: ISODate): number {
  return parseISODate(a).getTime() - parseISODate(b).getTime();
}

export function yearOf(value: ISODate): number {
  return parseISODate(value).getUTCFullYear();
}
