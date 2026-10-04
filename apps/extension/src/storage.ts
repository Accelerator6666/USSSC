import {
  DEFAULT_SETTINGS,
  type ExtensionSettings,
  type StoredTrade
} from "./model";

const TRADES_KEY = "usssc.trades";
const SETTINGS_KEY = "usssc.settings";

async function readValue<T>(key: string, fallback: T): Promise<T> {
  const values = await chrome.storage.local.get(key);
  return (values[key] as T | undefined) ?? fallback;
}

export async function listTrades(): Promise<StoredTrade[]> {
  const trades = await readValue<StoredTrade[]>(TRADES_KEY, []);
  return [...trades].sort((a, b) => {
    if (a.tradeDate !== b.tradeDate) return b.tradeDate.localeCompare(a.tradeDate);
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export async function replaceTrades(trades: StoredTrade[]): Promise<void> {
  await chrome.storage.local.set({ [TRADES_KEY]: trades });
}

export async function saveTrade(trade: StoredTrade): Promise<void> {
  const trades = await listTrades();
  const existingIndex = trades.findIndex((item) => item.id === trade.id);

  if (existingIndex >= 0) {
    trades[existingIndex] = trade;
  } else {
    trades.push(trade);
  }

  await replaceTrades(trades);
}

export async function updateTrade(
  id: string,
  patch: Partial<StoredTrade>
): Promise<StoredTrade | undefined> {
  const trades = await listTrades();
  const index = trades.findIndex((trade) => trade.id === id);
  if (index < 0) return undefined;

  const updated = { ...trades[index], ...patch };
  trades[index] = updated;
  await replaceTrades(trades);
  return updated;
}

export async function deleteTrade(id: string): Promise<void> {
  const trades = await listTrades();
  await replaceTrades(trades.filter((trade) => trade.id !== id));
}

export async function getSettings(): Promise<ExtensionSettings> {
  const stored = await readValue<Partial<ExtensionSettings>>(SETTINGS_KEY, {});
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function saveSettings(
  patch: Partial<ExtensionSettings>
): Promise<ExtensionSettings> {
  const settings = { ...(await getSettings()), ...patch };
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
  return settings;
}

export const storageKeys = {
  trades: TRADES_KEY,
  settings: SETTINGS_KEY
} as const;
