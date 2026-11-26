// Kakeibo Ledger — views.
//
// views.js turns the store's numbers into HTML strings, one function
// per page. It never writes to storage and never listens for events:
// main.js owns routing and every button. All text that came from the
// user passes through esc() before it reaches the page.

import { CATEGORIES, MONTH_HISTORY, REFERENCE } from './data.js';
import {
  budgetStatus,
  categoryOf,
  currentMonth,
  formatYen,
  goals,
  monthLabel,
  monthTotals,
  spendingByCategory,
  totalBudget,
  totalSaved,
  transactionsFor,
  trendHistory,
} from './store.js';
import { compareBars, donutChart, trendBars } from './charts.js';

export function esc(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function monthNav() {
  const month = currentMonth();
  return `<div class="month-nav" role="group" aria-label="Choose a month">`
    + `<button type="button" data-action="prev-month" aria-label="Previous month">‹</button>`
    + `<strong>${monthLabel(month)}</strong>`
    + `<button type="button" data-action="next-month" aria-label="Next month">›</button>`
    + `</div>`;
}

function categoryDot(categoryId) {
  const category = categoryOf(categoryId);
  const colour = category ? category.colour : '#8a8a7a';
  return `<span class="dot" style="background:${colour}"></span>`;
}

// --- Dashboard --------------------------------------------------------------

export function dashboard() {
  const month = currentMonth();
  const totals = monthTotals(month);
  const spent = spendingByCategory(month);
  const budget = totalBudget();
  const budgetLeft = budget - totals.spending;
  const slices = CATEGORIES
    .map((category) => ({ label: category.label, value: spent[category.id], colour: category.colour }))
    .filter((slice) => slice.value > 0);
  const recent = transactionsFor(month).slice(0, 6);
  const saved = totalSaved();
  const savedTarget = goals().reduce((sum, goal) => sum + goal.target, 0);

  const legend = CATEGORIES.map((category) => {
    const value = spent[category.id];
    if (value <= 0) return '';
    const share = totals.spending > 0 ? Math.round((value / totals.spending) * 100) : 0;
    return `<li><a href="#/transactions">${categoryDot(category.id)}${esc(category.label)}`
      + `<span class="legend-amount">${formatYen(value)} · ${share}%</span></a></li>`;
  }).join('');

  const recentRows = recent.length === 0
    ? '<p class="empty">No entries this month yet. Add one on the Transactions page.</p>'
    : `<ul class="tx-list">${recent.map((tx) => txRow(tx)).join('')}</ul>`;

  return `<section class="page-head">${monthNav()}
    <h1>Dashboard</h1>
    <p class="lede">What came in, what went out, and what is left for ${monthLabel(month)}.</p></section>

  <section class="stat-grid" aria-label="This month at a glance">
    <article class="stat-card"><span class="stat-label">Income</span>
      <span class="stat-value income">${formatYen(totals.income)}</span>
      <span class="stat-note">Salary and other money in</span></article>
    <article class="stat-card"><span class="stat-label">Spending</span>
      <span class="stat-value spending">${formatYen(totals.spending)}</span>
      <span class="stat-note">of a ${formatYen(budget)} monthly budget</span></article>
    <article class="stat-card"><span class="stat-label">Left to spend</span>
      <span class="stat-value ${totals.remaining < 0 ? 'over' : ''}">${formatYen(totals.remaining)}</span>
      <span class="stat-note">${budgetLeft >= 0 ? `${formatYen(budgetLeft)} still inside the budget` : `${formatYen(-budgetLeft)} over the budget`}</span></article>
  </section>

  <div class="two-col">
    <section class="card" aria-label="Spending by category">
      <h2>Where the money went</h2>
      ${donutChart(slices)}
      <ul class="legend">${legend}</ul>
    </section>
    <section class="card" aria-label="Recent transactions">
      <h2>Recent entries</h2>
      ${recentRows}
      <p><a class="button" href="#/transactions">See all transactions →</a></p>
    </section>
  </div>

  <section class="card savings-strip">
    <h2>Savings goals</h2>
    <p><strong>${formatYen(saved)}</strong> saved towards <strong>${formatYen(savedTarget)}</strong> across ${goals().length} goals.</p>
    <p><a class="button" href="#/goals">Open savings goals →</a></p>
  </section>`;
}

// --- Transactions -----------------------------------------------------------

export function txRow(tx) {
  const label = tx.kind === 'income' ? 'Income' : (categoryOf(tx.category)?.label || 'Other');
  const day = tx.date.slice(8, 10);
  const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(tx.date.slice(5, 7)) - 1];
  return `<li class="tx-row">
      <span class="tx-date"><strong>${day}</strong><span>${monthShort}</span></span>
      <span class="tx-main">${categoryDot(tx.category)}<span class="tx-note">${esc(tx.note)}</span>
        <span class="tx-cat">${esc(label)}</span></span>
      <span class="tx-amount ${tx.kind}">${tx.kind === 'income' ? '+' : '−'}${formatYen(tx.amount)}</span>
      <span class="tx-actions">
        <button type="button" data-action="edit-tx" data-id="${tx.id}">Edit</button>
        <button type="button" data-action="delete-tx" data-id="${tx.id}">Delete</button>
      </span>
    </li>`;
}

export function transactions(editing) {
  const month = currentMonth();
  const list = transactionsFor(month);
  const totals = monthTotals(month);
  const categoryOptions = CATEGORIES
    .map((category) => `<option value="${category.id}">${esc(category.label)}</option>`)
    .join('');

  const editPanel = editing
    ? `<section class="card edit-panel" aria-label="Edit entry">
        <h2>Edit entry</h2>
        <form data-form="edit-tx" data-id="${editing.id}">
          <label>Date <input type="date" name="date" value="${editing.date}" required></label>
          <label>Type <select name="kind">
            <option value="expense" ${editing.kind === 'expense' ? 'selected' : ''}>Spending</option>
            <option value="income" ${editing.kind === 'income' ? 'selected' : ''}>Income</option>
          </select></label>
          <label>Category <select name="category">
            <option value="income" ${editing.category === 'income' ? 'selected' : ''}>Income</option>
            ${CATEGORIES.map((c) => `<option value="${c.id}" ${editing.category === c.id ? 'selected' : ''}>${esc(c.label)}</option>`).join('')}
          </select></label>
          <label>Note <input type="text" name="note" value="${esc(editing.note)}" maxlength="80" required></label>
          <label>Amount (¥) <input type="number" name="amount" min="1" step="1" value="${editing.amount}" required></label>
          <span class="form-actions"><button type="submit" class="button primary">Save changes</button>
          <button type="button" data-action="cancel-edit">Cancel</button></span>
        </form>
      </section>`
    : '';

  const rows = list.length === 0
    ? '<p class="empty">No entries in this month. Add the first one above — it is saved in this browser only.</p>'
    : `<ul class="tx-list">${list.map((tx) => txRow(tx)).join('')}</ul>`;

  return `<section class="page-head">${monthNav()}
    <h1>Transactions</h1>
    <p class="lede">Every yen in and out for ${monthLabel(month)} — ${list.length} entries, ${formatYen(totals.spending)} spent.</p></section>

  <section class="card" aria-label="Add an entry">
    <h2>Add an entry</h2>
    <form data-form="add-tx" class="add-form">
      <label>Date <input type="date" name="date" value="${month}-26" required></label>
      <label>Type <select name="kind">
        <option value="expense">Spending</option>
        <option value="income">Income</option>
      </select></label>
      <label>Category <select name="category">${categoryOptions}</select></label>
      <label>Note <input type="text" name="note" placeholder="e.g. Supermarket — weekly shop" maxlength="80" required></label>
      <label>Amount (¥) <input type="number" name="amount" min="1" step="1" placeholder="5000" required></label>
      <span class="form-actions"><button type="submit" class="button primary">Add entry</button></span>
    </form>
  </section>

  ${editPanel}

  <section class="card" aria-label="Entries">
    <h2>Entries</h2>
    ${rows}
  </section>`;
}

// --- Budgets ----------------------------------------------------------------

export function budgets() {
  const month = currentMonth();
  const rows = budgetStatus(month);
  const total = totalBudget();
  const totals = monthTotals(month);
  const over = rows.filter((row) => row.over);

  const cards = rows.map((row) => {
    const pct = Math.min(100, Math.round(row.ratio * 100));
    const barClass = row.over ? 'bar over' : row.ratio > 0.85 ? 'bar near' : 'bar';
    return `<article class="budget-row">
      <header><h3>${categoryDot(row.id)}${esc(row.label)}</h3>
        <span class="budget-figures"><strong>${formatYen(row.spent)}</strong> of ${formatYen(row.budget)}</span></header>
      <div class="${barClass}" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(row.label)} budget used">
        <span style="width:${pct}%"></span></div>
      <p class="budget-note">${row.over
        ? `<span class="warn">Over budget by ${formatYen(row.spent - row.budget)}.</span> Consider moving money from a category with room left.`
        : `${pct}% used — ${formatYen(row.left)} left.`}
        <span class="budget-about">${esc(row.about)}</span></p>
      <form data-form="set-budget" data-category="${row.id}" class="budget-form">
        <label>Monthly budget <input type="number" name="amount" min="0" step="500" value="${row.budget}" required> ¥</label>
        <button type="submit">Set budget</button>
      </form>
    </article>`;
  }).join('');

  return `<section class="page-head">${monthNav()}
    <h1>Budgets</h1>
    <p class="lede">A monthly limit for each category. ${formatYen(totals.spending)} of the ${formatYen(total)} total budget is spent.</p></section>

  ${over.length > 0
    ? `<p class="alert" role="alert">⚠ ${over.length} categor${over.length === 1 ? 'y is' : 'ies are'} over budget: ${over.map((row) => esc(row.label)).join(', ')}.</p>`
    : '<p class="ok-note">✓ Every category is inside its budget this month.</p>'}

  <section class="budget-grid">${cards}</section>`;
}

// --- Insights ---------------------------------------------------------------

export function insights() {
  const history = trendHistory();
  const monthNames = history.map((row) => {
    const [, m] = row.month.split('-');
    return { ...row, label: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(m) - 1] };
  });
  const totals = monthTotals(currentMonth());
  const spent = spendingByCategory(currentMonth());
  const compareRows = REFERENCE.averageByCategory.map((row) => ({
    label: categoryOf(row.category)?.label || row.category,
    mine: spent[row.category] || 0,
    average: row.amount,
  }));
  const avg = REFERENCE.averageSpending;
  const savingRate = totals.income > 0 ? Math.round(((totals.income - totals.spending) / totals.income) * 100) : 0;

  return `<section class="page-head">
    <h1>Insights</h1>
    <p class="lede">Six months of income and spending, how this household compares with the national average, and three rules that keep a budget working.</p></section>

  <section class="card" aria-label="Monthly trend">
    <h2>Income vs spending — last six months</h2>
    ${trendBars(monthNames)}
    <p class="chart-key"><span class="key-dot" style="background:#2e6f5e"></span> Income
      <span class="key-dot" style="background:#c65a2e"></span> Spending</p>
    <p>This month you kept <strong>${savingRate}%</strong> of your income (${formatYen(totals.income - totals.spending)} of ${formatYen(totals.income)}). A common target is 20%.</p>
  </section>

  <section class="card" aria-label="Compared with Japan">
    <h2>How this household compares with Japan</h2>
    ${compareBars(compareRows)}
    <p class="chart-key"><span class="key-dot" style="background:#2e6f5e"></span> This household, ${monthLabel(currentMonth())}
      <span class="key-dot" style="background:#d9c9a8"></span> National average</p>
    <p class="source-note">${REFERENCE.foodShareNote} The average household of two or more people spent <strong>${formatYen(avg.amount)}</strong> a month. Source: ${esc(avg.source)}, ${esc(avg.year)}. Category figures are rounded monthly averages from the same survey; housing looks low because about six in ten Japanese households own their home and pay no rent.</p>
  </section>

  <section class="card guidance" aria-label="Three rules for a working budget">
    <h2>Three rules that keep a budget working</h2>
    <ol class="rules">
      <li><strong>50 · 30 · 20.</strong> Aim for about 50% of take-home pay on needs, 30% on wants and 20% on saving and paying down debt. If 20% is out of reach, start at 10% and raise it by 1% every month — the habit matters more than the number.</li>
      <li><strong>Pay yourself first.</strong> Move the saving amount to a separate account on payday, before spending starts. What stays in the spending account is what the month can use — this ledger's savings goals work the same way.</li>
      <li><strong>Keep three to six months of essential spending aside.</strong> An emergency fund turns a broken washing machine or a month between jobs into an inconvenience instead of a debt. Build it before chasing extra spending.</li>
    </ol>
    <p class="source-note">Rules of thumb for guidance only — they are not financial advice, and every household's numbers differ.</p>
  </section>`;
}

// --- Savings goals ------------------------------------------------------------

export function savingsGoals() {
  const list = goals();
  const saved = totalSaved();
  const target = list.reduce((sum, goal) => sum + goal.target, 0);

  const cards = list.length === 0
    ? '<p class="empty">No goals yet. Add one below — a trip, a new appliance, a safety net.</p>'
    : list.map((goal) => {
      const pct = goal.target > 0 ? Math.min(100, Math.round((goal.saved / goal.target) * 100)) : 0;
      const left = Math.max(0, goal.target - goal.saved);
      return `<article class="goal-card">
        <header><h3>${esc(goal.name)}</h3>
          <span class="goal-figures"><strong>${formatYen(goal.saved)}</strong> of ${formatYen(goal.target)}</span></header>
        <div class="bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(goal.name)} progress">
          <span style="width:${pct}%"></span></div>
        <p class="goal-note">${pct >= 100 ? '🎉 Goal reached!' : `${pct}% there — ${formatYen(left)} to go.`}
          <span class="budget-about">${esc(goal.note)}</span></p>
        <form data-form="add-to-goal" data-id="${goal.id}" class="goal-form">
          <label>Add to this goal <input type="number" name="amount" min="100" step="100" placeholder="10000" required> ¥</label>
          <button type="submit">Add</button>
          <button type="button" data-action="delete-goal" data-id="${goal.id}">Delete goal</button>
        </form>
      </article>`;
    }).join('');

  return `<section class="page-head">
    <h1>Savings goals</h1>
    <p class="lede"><strong>${formatYen(saved)}</strong> saved towards <strong>${formatYen(target)}</strong>. Small, regular amounts beat rare big ones.</p></section>

  <section class="goal-grid">${cards}</section>

  <section class="card" aria-label="Add a savings goal">
    <h2>Add a goal</h2>
    <form data-form="add-goal" class="add-form">
      <label>Goal name <input type="text" name="name" placeholder="e.g. New washing machine" maxlength="60" required></label>
      <label>Target (¥) <input type="number" name="target" min="1000" step="1000" placeholder="120000" required></label>
      <label>Already saved (¥) <input type="number" name="saved" min="0" step="1000" value="0" required></label>
      <label>Note <input type="text" name="note" placeholder="Why this goal matters" maxlength="100"></label>
      <span class="form-actions"><button type="submit" class="button primary">Add goal</button></span>
    </form>
  </section>`;
}

// --- shared -----------------------------------------------------------------

export function missing() {
  return `<section class="page-head"><h1>Page not found</h1>
    <p class="lede">That page does not exist in this ledger.</p>
    <p><a class="button" href="#/">Back to the dashboard →</a></p></section>`;
}
