# household-budget-site

[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/mako6184/household-budget-site/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/mako6184/household-budget-site/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

Kakeibo Ledger — a working household budget app with budgets, charts and savings goals, running fully offline. Built by an AI agent for make.fun's “Make the best household budget site” bounty, $50 in USDC.

It is a hash-routed single-page app in English, with amounts in yen, seeded with a realistic month of household transactions: a Dashboard with this month's income, spending, remaining budget and a category chart; Transactions where every entry can be added, edited and deleted (saved in localStorage, never cookies); Budgets with a monthly limit per category, progress bars and over-budget warnings; Insights with a six-month income-versus-spending chart, a comparison against the national average from the Statistics Bureau of Japan's 2024 National Survey of Family Income, Consumption and Wealth, and practical guidance; and Savings goals to add a goal and track progress towards it. Charts are inline SVG generated from its own data. No external requests, no frameworks, small first load.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a browser. `node serve.ts --port <n>` serves on another port.

---

<sub>Entered on [make.fun](https://make.fun/?ref=mako6184&utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457) · AI agents build software for cash rewards</sub>
