import {
  calculateSettlement,
  type AssetType,
  type SettlementResult
} from "@usssc/core";
import {
  createTradeId,
  getSettlementState,
  localISODate,
  type StoredTrade,
  type TradeSide
} from "./model";
import {
  deleteTrade,
  getSettings,
  listTrades,
  saveSettings,
  saveTrade
} from "./storage";
import "./popup.css";

function requiredElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`USSSC popup initialization failed: ${selector}`);
  return element;
}

const tabs = [...document.querySelectorAll<HTMLButtonElement>("[data-view]")];
const panels = [...document.querySelectorAll<HTMLElement>("[data-panel]")];

const tradeForm = requiredElement<HTMLFormElement>("#trade-form");
const tradeSymbol = requiredElement<HTMLInputElement>("#trade-symbol");
const tradeSide = requiredElement<HTMLSelectElement>("#trade-side");
const tradeAsset = requiredElement<HTMLSelectElement>("#trade-asset");
const tradeDate = requiredElement<HTMLInputElement>("#trade-date");
const tradeQuantity = requiredElement<HTMLInputElement>("#trade-quantity");
const tradePrice = requiredElement<HTMLInputElement>("#trade-price");
const tradeMessage = requiredElement<HTMLElement>("#trade-message");
const tradeList = requiredElement<HTMLElement>("#trade-list");
const upcomingList = requiredElement<HTMLElement>("#upcoming-list");

const statRecords = requiredElement<HTMLElement>("#stat-records");
const statPending = requiredElement<HTMLElement>("#stat-pending");
const statToday = requiredElement<HTMLElement>("#stat-today");
const statSettled = requiredElement<HTMLElement>("#stat-settled");

const calculator = requiredElement<HTMLFormElement>("#calculator");
const calcTradeDate = requiredElement<HTMLInputElement>("#calc-trade-date");
const calcAssetType = requiredElement<HTMLSelectElement>("#calc-asset-type");
const resultBox = requiredElement<HTMLElement>("#result");
const errorBox = requiredElement<HTMLElement>("#error");

const settingsForm = requiredElement<HTMLFormElement>("#settings-form");
const remindersEnabled = requiredElement<HTMLInputElement>("#reminders-enabled");
const reminderTime = requiredElement<HTMLInputElement>("#reminder-time");
const settingsMessage = requiredElement<HTMLElement>("#settings-message");
const goAddTrade = requiredElement<HTMLButtonElement>("#go-add-trade");

tradeDate.value = localISODate();
calcTradeDate.value = localISODate();

function showView(name: string): void {
  for (const tab of tabs) {
    tab.classList.toggle("is-active", tab.dataset.view === name);
  }
  for (const panel of panels) {
    panel.classList.toggle("is-active", panel.dataset.panel === name);
  }
}

for (const tab of tabs) {
  tab.addEventListener("click", () => showView(tab.dataset.view ?? "dashboard"));
}

goAddTrade.addEventListener("click", () => {
  showView("trades");
  tradeSymbol.focus();
});

function showMessage(target: HTMLElement, text: string, kind: "success" | "error" = "success"): void {
  target.textContent = text;
  target.dataset.kind = kind;
  target.hidden = false;
}

function createEmpty(text: string): HTMLElement {
  const empty = document.createElement("p");
  empty.className = "empty";
  empty.textContent = text;
  return empty;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 6 }).format(value);
}

function stateLabel(state: ReturnType<typeof getSettlementState>): string {
  if (state === "today") return "SETTLES TODAY";
  if (state === "settled") return "EST. SETTLED";
  return "PENDING";
}

function renderTradeCard(trade: StoredTrade, allowDelete: boolean): HTMLElement {
  const card = document.createElement("article");
  card.className = "trade-row";

  const state = getSettlementState(trade.settlementDate, localISODate());

  const main = document.createElement("div");
  main.className = "trade-main";

  const titleLine = document.createElement("div");
  titleLine.className = "trade-title-line";

  const symbol = document.createElement("strong");
  symbol.textContent = trade.symbol;

  const side = document.createElement("span");
  side.className = `side side-${trade.side}`;
  side.textContent = trade.side.toUpperCase();

  const stateBadge = document.createElement("span");
  stateBadge.className = `state state-${state}`;
  stateBadge.textContent = stateLabel(state);

  titleLine.append(symbol, side, stateBadge);

  const meta = document.createElement("p");
  const priceText = trade.price === undefined ? "" : ` @ $${formatNumber(trade.price)}`;
  meta.textContent = `${formatNumber(trade.quantity)} shares${priceText} · Trade ${trade.tradeDate}`;

  const settlement = document.createElement("p");
  settlement.className = "settlement-line";
  settlement.textContent = `${trade.cycle} → expected ${trade.settlementDate}`;

  main.append(titleLine, meta, settlement);
  card.append(main);

  if (allowDelete) {
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "delete-button";
    remove.textContent = "Delete";
    remove.dataset.tradeId = trade.id;
    card.append(remove);
  }

  return card;
}

async function renderDashboard(): Promise<void> {
  const trades = await listTrades();
  const currentDate = localISODate();
  const pending = trades.filter((trade) => getSettlementState(trade.settlementDate, currentDate) === "pending");
  const settlingToday = trades.filter((trade) => getSettlementState(trade.settlementDate, currentDate) === "today");
  const settled = trades.filter((trade) => getSettlementState(trade.settlementDate, currentDate) === "settled");

  statRecords.textContent = String(trades.length);
  statPending.textContent = String(pending.length);
  statToday.textContent = String(settlingToday.length);
  statSettled.textContent = String(settled.length);

  const upcoming = [...settlingToday, ...pending]
    .sort((a, b) => a.settlementDate.localeCompare(b.settlementDate))
    .slice(0, 6);

  upcomingList.replaceChildren();
  if (upcoming.length === 0) {
    upcomingList.append(createEmpty("No upcoming settlements."));
    return;
  }

  for (const trade of upcoming) {
    upcomingList.append(renderTradeCard(trade, false));
  }
}

async function renderTradeList(): Promise<void> {
  const trades = await listTrades();
  tradeList.replaceChildren();

  if (trades.length === 0) {
    tradeList.append(createEmpty("No local trade records yet."));
    return;
  }

  for (const trade of trades) {
    tradeList.append(renderTradeCard(trade, true));
  }
}

async function renderSettings(): Promise<void> {
  const settings = await getSettings();
  remindersEnabled.checked = settings.settlementReminders;
  reminderTime.value = settings.reminderTime;
  reminderTime.disabled = !settings.settlementReminders;
}

async function renderAll(): Promise<void> {
  await Promise.all([renderDashboard(), renderTradeList(), renderSettings()]);
}

tradeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  tradeMessage.hidden = true;

  void (async () => {
    try {
      const symbol = tradeSymbol.value.trim().toUpperCase();
      const quantity = Number(tradeQuantity.value);
      const parsedPrice = tradePrice.value.trim() === "" ? undefined : Number(tradePrice.value);

      if (!/^[A-Z0-9.\-]{1,12}$/.test(symbol)) {
        throw new Error("Symbol format is invalid.");
      }
      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new Error("Quantity must be greater than zero.");
      }
      if (parsedPrice !== undefined && (!Number.isFinite(parsedPrice) || parsedPrice < 0)) {
        throw new Error("Price must be zero or greater.");
      }

      const settlement = calculateSettlement({
        tradeDate: tradeDate.value,
        assetType: tradeAsset.value as AssetType
      });

      const trade: StoredTrade = {
        id: createTradeId(),
        createdAt: new Date().toISOString(),
        symbol,
        side: tradeSide.value as TradeSide,
        quantity,
        ...(parsedPrice === undefined ? {} : { price: parsedPrice }),
        assetType: tradeAsset.value as AssetType,
        tradeDate: settlement.tradeDate,
        settlementDate: settlement.settlementDate,
        cycle: settlement.cycle,
        ruleLabel: settlement.ruleLabel
      };

      await saveTrade(trade);
      showMessage(tradeMessage, `${symbol} saved · expected settlement ${trade.settlementDate}`);

      tradeSymbol.value = "";
      tradeQuantity.value = "";
      tradePrice.value = "";
      tradeDate.value = localISODate();
      await renderAll();
    } catch (error) {
      showMessage(
        tradeMessage,
        error instanceof Error ? error.message : String(error),
        "error"
      );
    }
  })();
});

tradeList.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const button = target.closest<HTMLButtonElement>("[data-trade-id]");
  if (!button?.dataset.tradeId) return;

  void (async () => {
    await deleteTrade(button.dataset.tradeId!);
    await renderAll();
  })();
});

function renderResult(result: SettlementResult): void {
  resultBox.replaceChildren();

  const summary = document.createElement("div");
  summary.className = "summary";

  const cycle = document.createElement("div");
  const cycleLabel = document.createElement("span");
  cycleLabel.textContent = "Cycle";
  const cycleValue = document.createElement("strong");
  cycleValue.textContent = result.cycle;
  cycle.append(cycleLabel, cycleValue);

  const settlement = document.createElement("div");
  const settlementLabel = document.createElement("span");
  settlementLabel.textContent = "Expected settlement";
  const settlementValue = document.createElement("strong");
  settlementValue.textContent = result.settlementDate;
  settlement.append(settlementLabel, settlementValue);

  summary.append(cycle, settlement);

  const timeline = document.createElement("ol");
  timeline.className = "timeline";

  for (const entry of result.timeline) {
    const item = document.createElement("li");
    item.className = `timeline-${entry.kind}`;

    const title = document.createElement("strong");
    title.textContent = entry.date;

    const detail = document.createElement("span");
    detail.textContent = entry.reason;

    item.append(title, detail);
    timeline.append(item);
  }

  const rule = document.createElement("p");
  rule.className = "rule";
  rule.textContent = `${result.ruleLabel} · ${result.calendarVersion}`;

  resultBox.append(summary, timeline, rule);
  resultBox.hidden = false;
}

calculator.addEventListener("submit", (event) => {
  event.preventDefault();
  errorBox.hidden = true;
  resultBox.hidden = true;

  try {
    const result = calculateSettlement({
      tradeDate: calcTradeDate.value,
      assetType: calcAssetType.value as AssetType
    });
    renderResult(result);
  } catch (error) {
    errorBox.textContent = error instanceof Error ? error.message : String(error);
    errorBox.hidden = false;
  }
});

remindersEnabled.addEventListener("change", () => {
  reminderTime.disabled = !remindersEnabled.checked;
});

settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  settingsMessage.hidden = true;

  void (async () => {
    await saveSettings({
      settlementReminders: remindersEnabled.checked,
      reminderTime: reminderTime.value || "09:00"
    });
    showMessage(settingsMessage, "Reminder settings saved.");
    await renderSettings();
  })();
});

chrome.storage.onChanged.addListener((_changes, areaName) => {
  if (areaName === "local") void renderAll();
});

void renderAll();
