import { formatTradeLabel, localISODate } from "./model";
import { getSettings, listTrades, storageKeys, updateTrade } from "./storage";

const ALARM_PREFIX = "usssc:settlement:";

function reminderTimestamp(date: string, time: string): number {
  const [hour = "09", minute = "00"] = time.split(":");
  return new Date(`${date}T${hour}:${minute}:00`).getTime();
}

async function clearSettlementAlarms(): Promise<void> {
  const alarms = await chrome.alarms.getAll();
  await Promise.all(
    alarms
      .filter((alarm) => alarm.name.startsWith(ALARM_PREFIX))
      .map((alarm) => chrome.alarms.clear(alarm.name))
  );
}

export async function syncSettlementAlarms(): Promise<void> {
  await clearSettlementAlarms();

  const settings = await getSettings();
  if (!settings.settlementReminders) return;

  const now = Date.now();
  const today = localISODate();
  const trades = await listTrades();

  for (const trade of trades) {
    if (trade.settlementDate < today) continue;
    if (trade.remindedForSettlementDate === trade.settlementDate) continue;

    let when = reminderTimestamp(trade.settlementDate, settings.reminderTime);

    // If the browser starts after the configured reminder time on settlement day,
    // fire shortly after startup rather than silently dropping the reminder.
    if (trade.settlementDate === today && when <= now) {
      when = now + 5_000;
    }

    if (when <= now) continue;

    await chrome.alarms.create(`${ALARM_PREFIX}${trade.id}`, { when });
  }
}

chrome.runtime.onInstalled.addListener(() => {
  void syncSettlementAlarms();
});

chrome.runtime.onStartup.addListener(() => {
  void syncSettlementAlarms();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;
  if (changes[storageKeys.trades] || changes[storageKeys.settings]) {
    void syncSettlementAlarms();
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (!alarm.name.startsWith(ALARM_PREFIX)) return;

  void (async () => {
    const tradeId = alarm.name.slice(ALARM_PREFIX.length);
    const trades = await listTrades();
    const trade = trades.find((item) => item.id === tradeId);
    if (!trade) return;

    await chrome.notifications.create(`usssc:settlement-notice:${trade.id}`, {
      type: "basic",
      iconUrl: chrome.runtime.getURL("icon.svg"),
      title: `${trade.symbol} 今日预计交割`,
      message: `${formatTradeLabel(trade)} · ${trade.cycle} · ${trade.settlementDate}`,
      priority: 1
    });

    await updateTrade(trade.id, {
      remindedForSettlementDate: trade.settlementDate
    });
  })();
});
