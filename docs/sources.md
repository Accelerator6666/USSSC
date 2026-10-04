# Rule and Calendar Sources

USSSC keeps regulatory and operational sources separate from application logic.

## Settlement-cycle rule

- SEC: Shortening the Securities Transaction Settlement Cycle
  - T+1 compliance date: 2024-05-28
  - https://www.sec.gov/compliance/risk-alerts/shortening-securities-transaction-settlement-cycle
- SEC Rule 15c6-1 compliance guide
  - https://www.sec.gov/investment/settlement-cycle-small-entity-compliance-guide-15c6-1-15c6-2-204-2

## DTCC / NSCC calendar references

### 2024

- DTC Settlement Anticipated Holiday Schedule: 2024
  - https://www.dtcc.com/-/media/Files/pdf/2023/12/12/19404-23.pdf

### 2025

- DTC Settlement Anticipated Holiday Schedule: 2025
  - https://www.dtcc.com/Globals/PDFs/2024/October/30/20972-24
- National Day of Mourning for U.S. President Jimmy Carter
  - DTCC remained open for clearance and settlement on 2025-01-09 while equity markets were closed.
  - https://www.dtcc.com/-/media/Files/pdf/2024/12/31/National-Day-of-Mourning-for-US-President-Jimmy-Carter.pdf

### 2026

- DTC Settlement Anticipated Holiday Schedule: 2026
  - https://www.dtcc.com/-/media/Files/pdf/2025/10/15/23036-25.pdf
- NSCC Good Friday 2026
  - https://www.dtcc.com/-/media/Files/pdf/2026/3/6/a9732.pdf
- NSCC Independence Day 2026
  - https://www.dtcc.com/-/media/Files/pdf/2026/6/5/a9778.pdf

## Source policy

Annual calendars in code should be updated only from primary market-infrastructure or regulator sources. Unscheduled closures must be represented explicitly, because the trading calendar and settlement calendar may diverge.
