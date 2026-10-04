# USSSC Architecture

## Principle

Settlement is a rules-and-calendar problem, not a simple `tradeDate + N` calculation.

The v0.1 architecture keeps three concerns separate:

```text
Trade Date
   │
   ├── Trading Calendar validation
   │
   ├── Settlement Rule resolution (T+2 / T+1)
   │
   └── Settlement Calendar traversal
             │
             ▼
       Settlement Date
             │
             └── Explanation Timeline
```

## Packages

### `@usssc/core`

Pure TypeScript with no browser dependency.

Responsibilities:

- ISO date parsing and UTC-safe date arithmetic
- U.S. equity / ETF settlement rule selection
- Trading-day validation
- Settlement-day validation
- Timeline generation

The package must stay usable by future Web, browser extension, CLI and broker-import adapters.

### `@usssc/extension`

Manifest V3 browser extension UI.

The extension is intentionally thin: it gathers input, calls `@usssc/core`, and renders the explanation. Business rules must not be duplicated in UI code.

## Calendar model

USSSC deliberately uses separate calendars:

- `isUsEquityTradingDay()`
- `isUsEquitySettlementDay()`

A date can be:

- trading + settlement day
- non-trading + settlement day
- trading + non-settlement day
- neither

This is necessary for real U.S. market operations.

## Verified-year policy

Holiday behavior can be changed by unscheduled market closures and annual DTCC/NSCC notices. Therefore v0.1 only calculates dates using years whose calendars are explicitly verified in source control.

Unsupported years throw `UnsupportedCalendarYearError`; the engine does not silently infer financial-market holidays.

## Future modules

```text
packages/
├── core/
├── cash-ledger/
├── risk-engine/
└── broker-adapters/
    ├── ibkr-csv/
    └── ibkr-flex/
```

The cash ledger should model `CashLot`, `FundingSource`, `SettlementDependency`, and `RiskEvent` rather than only aggregate cash balances.
