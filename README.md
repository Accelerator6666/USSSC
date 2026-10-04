# USSSC

**U.S. Stock Settlement Cycle** — 美股交易交割周期、交易记录与结算提醒工具。

USSSC 不只是“交易日 + 1”的日期计算器。核心设计把 **交易日、交割日、Settlement Calendar 与历史规则** 分离成可测试的引擎；浏览器插件在此基础上提供本地交易记录、Dashboard 和结算日提醒。

## 当前版本

`v0.4.0-dev`

当前采用 **v0.4 优先** 的开发顺序：先把插件做成日常可使用的本地结算面板，再继续 Cash Ledger、GFV 风险检查和 IBKR 导入。

### 已完成

- 股票 / ETF 交割周期规则引擎
- 2024-05-28 前后的 T+2 → T+1 切换
- 独立的 U.S. equity Trading Calendar 与 Settlement Calendar
- 2024–2026 已核验日历数据
- 周末、市场休市日、仅结算日、银行假日差异化处理
- Settlement Timeline
- Chrome / Edge Manifest V3 插件
- **本地交易记录**：Symbol、BUY/SELL、数量、可选价格、交易日、预计交割日
- **Settlement Dashboard**：Records / Pending / Today / Estimated settled
- **Upcoming Settlements**：按预计交割日排序
- **本机结算提醒**：Chrome alarms + notifications
- **提醒时间设置**：使用浏览器所在设备的本地时间
- Vitest 核心规则测试

## Local-first

交易记录使用：

```text
chrome.storage.local
```

当前版本不会把交易记录上传到 USSSC 服务器或第三方服务。结算提醒同样由浏览器扩展在本机生成。

> Dashboard 中的 `settled` 状态仅表示计算出的预计交割日期已经到达或经过，不代表经纪商已确认最终交割。最终状态以 broker / DTCC / NSCC 记录为准。

## 插件功能

### Dashboard

显示：

- 本地记录总数
- 尚未到预计交割日的交易
- 今日预计交割的交易
- 已经过预计交割日的交易
- 最近 6 笔 Upcoming Settlements

### Trades

手动记录：

```text
Symbol
Side: BUY / SELL
Asset: Stock / ETF
Trade Date
Quantity
Price (optional)
```

保存时 USSSC 会调用核心 Settlement Engine 自动计算：

```text
Trade Date
   ↓
T+1 / historical T+2
   ↓
Settlement Calendar
   ↓
Expected Settlement Date
```

### Settlement reminders

默认：

```text
Enabled
09:00 local time
```

浏览器扩展会为尚未提醒且尚未过期的本地交易创建一次性 alarm。若浏览器在交割日的设定时间之后才启动，USSSC 会在启动后补发当日提醒。

### Calculator

保留原来的独立交割日期计算器，并显示完整 Settlement Timeline。

## 关键设计

USSSC 明确区分：

1. **Trading Calendar**：当天能否进行正常美股交易。
2. **Settlement Calendar**：当天能否进行标准股票 / ETF 交割。

这两个概念不能合并。例如 2025-01-09（美国前总统 Carter 全国哀悼日）美股市场休市，但 DTCC/NSCC 正常提供清算与交割服务；而 Columbus Day / Veterans Day 交易市场通常开放，但标准结算可能不进行。

## 本地开发

```bash
npm install
npm test
npm run build
```

构建后浏览器插件位于：

```text
apps/extension/dist/
```

Chrome / Edge：

1. 打开扩展管理页面。
2. 开启 Developer mode / 开发人员模式。
3. Load unpacked / 加载已解压的扩展。
4. 选择 `apps/extension/dist/`。

Manifest v3 当前需要的权限：

```text
storage
alarms
notifications
```

不要求访问任意网页内容，也不要求远程主机权限。

## Monorepo

```text
USSSC/
├── apps/
│   └── extension/
│       ├── public/
│       │   ├── manifest.json
│       │   └── icon.svg
│       └── src/
│           ├── background.ts
│           ├── model.ts
│           ├── storage.ts
│           ├── popup.ts
│           └── popup.css
├── packages/
│   └── core/
├── docs/
│   ├── architecture.md
│   ├── sources.md
│   └── v0.4.md
├── package.json
└── tsconfig.base.json
```

## 当前支持范围

- Asset: U.S. equities / ETFs
- Rule: T+2 historical + T+1 current
- Calendar coverage: 2024, 2025, 2026
- 日期采用 ISO `YYYY-MM-DD`
- 核心计算采用 UTC date-only 逻辑，避免浏览器时区导致日期漂移
- 提醒时间采用用户浏览器所在设备的本地时区

对于未核验年份，核心引擎会明确报错，而不是猜测假日日历。

## 下一阶段

v0.4 先稳定后，再继续：

- v0.2: Settled / Unsettled Cash Ledger
- v0.2: Good Faith Violation 风险检查
- v0.3: IBKR CSV / Flex Query 导入
- v0.4.x: 本地记录导出 / 导入、筛选、批量管理
- v1.0: Broker adapters / rule-data auto update

## Disclaimer

USSSC 是交易辅助与教育工具，不构成投资、法律、税务或经纪业务建议。插件显示的是基于规则和日历计算出的 **预计交割日期**，最终交割状态应以经纪商、DTCC/NSCC 及适用监管规则为准。

## License

MIT
