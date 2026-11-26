// Kakeibo Ledger — state.
//
// store.js is the only file that talks to localStorage. It loads the
// seed data from data.js on first run, saves every change, and answers
// the questions the views ask: what came in, what went out, what is
// left, and how each category stands against its budget. Nothing here
// builds HTML; that is views.js's job.

import {
  CATEGORIES,
  CURRENT_MONTH,
  MONTH_HISTORY,
  SEED_BUDGETS,
  SEED_GOALS,
  SEED_TRANSACTIONS,
} from './data.js';

const STORAGE_KEY = 'kakeibo-ledger-v1';

// A deep copy, so the seed data is never mutated by accident.
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function defaultState() {
  return {
    month: CURRENT_MONTH,
    transactions: clone(SEED_TRANSACTIONS),
    budgets: { ...SEED_BUDGETS },
    goals: clone(SEED_GOALS),
  };
}

function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.transactions)) return defaultState();
    return {
      month: typeof parsed.month === 'string' ? parsed.month : CURRENT_MONTH,
      transactions: parsed.transactions,
      budgets: { ...SEED_BUDGETS, ...(parsed.budgets || {}) },
      goals: Array.isArray(parsed.goals) ? parsed.goals : clone(SEED_GOALS),
    };
  } catch {
    return defaultState();
  }
}

let state = loadState();

function save() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable: the page keeps working in memory.
  }
}

// --- months ---------------------------------------------------------------

export function currentMonth() {
  return state.month;
}

export function setMonth(month) {
  state.month = month;
  save();
}

export function shiftMonth(delta) {
  const [year, month] = state.month.split('-').map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  state.month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  save();
}

export function monthLabel(month) {
  const [year, m] = month.split('-').map(Number);
  const names = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${names[m - 1]} ${year}`;
}

function inMonth(tx, month) {
  return tx.date.slice(0, 7) === month;
}

// --- transactions ---------------------------------------------------------

export function transactionsFor(month) {
  return state.transactions
    .filter((tx) => inMonth(tx, month))
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function transactionById(id) {
  return state.transactions.find((tx) => tx.id === id) || null;
}

function nextId(prefix) {
  let n = state.transactions.length + state.goals.length + 1;
  let id = `${prefix}${n}`;
  while (state.transactions.some((tx) => tx.id === id) || state.goals.some((g) => g.id === id)) {
    n += 1;
    id = `${prefix}${n}`;
  }
  return id;
}

export function addTransaction(tx) {
  const entry = { ...tx, id: nextId('t') };
  state.transactions.push(entry);
  save();
  return entry;
}

export function updateTransaction(id, patch) {
  const tx = transactionById(id);
  if (!tx) return false;
  Object.assign(tx, patch);
  save();
  return true;
}

export function deleteTransaction(id) {
  const before = state.transactions.length;
  state.transactions = state.transactions.filter((tx) => tx.id !== id);
  if (state.transactions.length !== before) save();
  return state.transactions.length !== before;
}

// --- totals ---------------------------------------------------------------

export function monthTotals(month) {
  let income = 0;
  let spending = 0;
  for (const tx of state.transactions) {
    if (!inMonth(tx, month)) continue;
    if (tx.kind === 'income') income += tx.amount;
    else spending += tx.amount;
  }
  return { income, spending, remaining: income - spending };
}

export function spendingByCategory(month) {
  const totals = {};
  for (const category of CATEGORIES) totals[category.id] = 0;
  for (const tx of state.transactions) {
    if (!inMonth(tx, month) || tx.kind === 'income') continue;
    if (tx.category in totals) totals[tx.category] += tx.amount;
  }
  return totals;
}

export function totalBudget() {
  return Object.values(state.budgets).reduce((sum, value) => sum + value, 0);
}

export function budgetFor(categoryId) {
  return state.budgets[categoryId] || 0;
}

export function setBudget(categoryId, amount) {
  state.budgets[categoryId] = amount;
  save();
}

export function budgetStatus(month) {
  const spent = spendingByCategory(month);
  return CATEGORIES.map((category) => {
    const budget = state.budgets[category.id] || 0;
    const used = spent[category.id] || 0;
    return {
      ...category,
      budget,
      spent: used,
      left: budget - used,
      ratio: budget > 0 ? used / budget : 0,
      over: used > budget,
    };
  });
}

// --- savings goals --------------------------------------------------------

export function goals() {
  return state.goals;
}

export function addGoal(goal) {
  const entry = { ...goal, id: nextId('g') };
  state.goals.push(entry);
  save();
  return entry;
}

export function addToGoal(id, amount) {
  const goal = state.goals.find((g) => g.id === id);
  if (!goal) return false;
  goal.saved = Math.max(0, goal.saved + amount);
  save();
  return true;
}

export function deleteGoal(id) {
  const before = state.goals.length;
  state.goals = state.goals.filter((g) => g.id !== id);
  if (state.goals.length !== before) save();
  return state.goals.length !== before;
}

export function totalSaved() {
  return state.goals.reduce((sum, goal) => sum + goal.saved, 0);
}

// --- history for the trend chart ------------------------------------------

export function trendHistory() {
  const now = monthTotals(CURRENT_MONTH);
  return MONTH_HISTORY.map((row) => ({
    month: row.month,
    income: row.income,
    spending: row.month === CURRENT_MONTH ? now.spending : row.spending,
  }));
}

// --- helpers --------------------------------------------------------------

export function formatYen(amount) {
  const sign = amount < 0 ? '−' : '';
  return `${sign}¥${Math.abs(Math.round(amount)).toLocaleString('en-US')}`;
}

export function categoryOf(id) {
  return CATEGORIES.find((category) => category.id === id) || null;
}

export function resetAll() {
  state = defaultState();
  save();
}
