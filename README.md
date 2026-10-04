# USSSC

**U.S. Stock Settlement Cycle** — 美股交易交割周期与资金结算辅助工具。

USSSC 的目标不是只做一个“交易日 + 1”的日期计算器，而是把 **交易日、交割日、结算日历、历史 T+2 / 当前 T+1 规则** 分离成可测试的核心引擎，再提供 Chrome / Edge 插件界面。

## 当前版本

`v0.1.0-dev`

已完成第一阶段骨架：

- 股票 / ETF 交割周期规则引擎
- 2024-05-28 前后的 T+2 → T+1 切换
- 独立的美股交易日历与 NSCC/DTC 结算日历
- 2024–2026 已核验日历数据
- 周末、市场休市日、仅结算日、银行假日的差异化处理
- 交割 Timeline
- Chrome / Edge Manifest V3 插件 MVP
- Vitest 单元测试

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

## Monorepo

```text
USSSC/
├── apps/
│   └── extension/          # Chrome / Edge 插件
├── packages/
│   └── core/               # 交割规则与日历引擎
├── docs/
│   ├── architecture.md
│   └── sources.md
├── package.json
└── tsconfig.base.json
```

## 当前支持范围

- Asset: U.S. equities / ETFs
- Rule: T+2 historical + T+1 current
- Calendar coverage: 2024, 2025, 2026
- 日期采用 ISO `YYYY-MM-DD`
- 核心计算采用 UTC date-only 逻辑，避免浏览器时区导致日期漂移

对于未核验年份，核心引擎会明确报错，而不是猜测假日日历。

## 后续路线

- v0.2: Settled / Unsettled Cash Ledger
- v0.2: Good Faith Violation 风险检查
- v0.3: IBKR CSV / Flex Query 导入
- v0.4: 本地交易记录、结算提醒与 Dashboard
- v1.0: Broker adapters / rule-data auto update

## Disclaimer

USSSC 是交易辅助与教育工具，不构成投资、法律、税务或经纪业务建议。最终交割状态应以经纪商、DTCC/NSCC 及适用监管规则为准。

## License

MIT
