import {
  calculateSettlement,
  type AssetType,
  type SettlementResult
} from "@usssc/core";
import "./popup.css";

const form = document.querySelector<HTMLFormElement>("#calculator");
const dateInput = document.querySelector<HTMLInputElement>("#trade-date");
const assetInput = document.querySelector<HTMLSelectElement>("#asset-type");
const resultBox = document.querySelector<HTMLElement>("#result");
const errorBox = document.querySelector<HTMLElement>("#error");

if (!form || !dateInput || !assetInput || !resultBox || !errorBox) {
  throw new Error("USSSC popup initialization failed.");
}

const now = new Date();
const localToday = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, "0"),
  String(now.getDate()).padStart(2, "0")
].join("-");
dateInput.value = localToday;

function renderResult(result: SettlementResult): void {
  resultBox.replaceChildren();

  const summary = document.createElement("div");
  summary.className = "summary";
  summary.innerHTML = `
    <div><span>Cycle</span><strong>${result.cycle}</strong></div>
    <div><span>Settlement</span><strong>${result.settlementDate}</strong></div>
  `;

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

form.addEventListener("submit", (event) => {
  event.preventDefault();
  errorBox.hidden = true;
  resultBox.hidden = true;

  try {
    const result = calculateSettlement({
      tradeDate: dateInput.value,
      assetType: assetInput.value as AssetType
    });
    renderResult(result);
  } catch (error) {
    errorBox.textContent = error instanceof Error ? error.message : String(error);
    errorBox.hidden = false;
  }
});
