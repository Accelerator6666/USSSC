import type { AssetType, ISODate } from "@usssc/core";

export type TradeSide = "buy" | "sell";

export interface StoredTrade {
  id: string;
  createdAt: string;
  symbol: string;
  side: TradeSide;
  quantity: number;
  price?: number;
  assetType: AssetType;
  tradeDate: ISODate;
  settlementDate: ISODate;
  cycle: `T+${number}`;
  ruleLabel: string;
  remindedForSettlementDate?: ISODate;
}

export interface ExtensionSettings {
  settlementReminders: boolean;
  reminderTime: string;
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  settlementReminders: true,
  reminderTime: "09:00"
};

export type SettlementState = "pending" | "today" | "settled";

export function getSettlementState(
  settlementDate: ISODate,
  today: ISODate
): SettlementState {
  if (settlementDate === today) return "today";
  return settlementDate > today ? "pending" : "settled";
}

export function localISODate(now = new Date()): ISODate {
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");
}

export function formatTradeLabel(trade: StoredTrade): string {
  return `${trade.side === "buy" ? "BUY" : "SELL"} ${trade.quantity} ${trade.symbol}`;
}

export function createTradeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `trade-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
