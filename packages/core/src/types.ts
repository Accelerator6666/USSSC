export type ISODate = string;

export type AssetType = "equity" | "etf";

export interface SettlementRule {
  id: string;
  assetTypes: readonly AssetType[];
  effectiveFrom: ISODate;
  effectiveTo?: ISODate;
  cycleDays: number;
  label: string;
  sourceLabel: string;
  sourceUrl: string;
}

export type TimelineKind =
  | "trade"
  | "settlement-business-day"
  | "skipped"
  | "settlement";

export interface SettlementTimelineEntry {
  date: ISODate;
  kind: TimelineKind;
  reason: string;
  countedBusinessDays: number;
}

export interface SettlementRequest {
  tradeDate: ISODate;
  assetType: AssetType;
}

export interface SettlementResult {
  tradeDate: ISODate;
  settlementDate: ISODate;
  assetType: AssetType;
  cycle: `T+${number}`;
  cycleDays: number;
  ruleId: string;
  ruleLabel: string;
  ruleSourceUrl: string;
  calendarVersion: string;
  timeline: SettlementTimelineEntry[];
}

export type CalendarStatus =
  | { open: true; reason: string }
  | { open: false; reason: string };
